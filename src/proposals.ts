import { knex } from './db';
import { Message, Client, TextChannel, Channel } from 'discord.js';
import { tAction } from './actionParser';
import {
  actionAsHumanReadable,
  validateAction,
  getActions,
  validateActions,
  executeActions,
} from './actions';

// Global list of running intervals.  This
// list is populated at start time with data from
// the database, and its accurately maintained throughout
// runtime.
export const gIntervalList: {
  [key: string]: NodeJS.Timeout;
} = {};

export enum ProposalStatus {
  Building,
  Running,
  Cancelled,
  Passed,
  Failed,
  ExecutionError,
}

export enum Vote {
  Yes,
  No,
}

enum ProposalColor {
  Gray = 10197915,
  Blue = 4886754,
  Green = 8311585,
  Red = 13632027,
  Black = 1,
  Orange = 14786870,
}

export interface Proposal {
  author: string;
  id: string;
  createdOn: Date;
  expiresOn: Date;
  duration: number;
  name: string;
  description: string;
  status: ProposalStatus;
  message: string;
  server: string;
  channel: string;
}

export interface Votes {
  [Vote.Yes]: number;
  [Vote.No]: number;
}

export function getDurationString(duration: number): string {
  if (duration < 60) return `${duration} seconds`;
  if (duration < 60 * 60) return `${Math.floor(duration / 60)} minutes`;
  if (duration < 60 * 60 * 24)
    return `${Math.floor(duration / (60 * 60))} hours`;
  return `${Math.floor(duration / (60 * 60 * 24))} days`;
}

export async function getMessageObject(
  client: Client,
  proposal: Proposal
): Promise<Message> {
  const guild = client.guilds.resolve(proposal.server);
  const channel = guild.channels.resolve(proposal.channel) as TextChannel;
  return await channel.messages.fetch(proposal.message);
}

export async function refreshProposalMessage(
  client: Client,
  proposal: Proposal,
  updateVotes: boolean = true,
  updateActions: boolean = true
): Promise<Message> {
  const proposalMessage = await getMessageObject(client, proposal);
  let votes: Votes = null;
  let actions: tAction[] = null;
  if (updateVotes && !updateActions) {
    votes = await countVotes(proposal.id);
  }
  if (!updateVotes && updateActions) {
    actions = await getActions(proposal.id);
  }
  if (updateVotes && updateActions) {
    actions = await getActions(proposal.id);
    votes = await countVotes(proposal.id);
  }
  await proposalMessage.edit(generateProposalEmbed(proposal, votes, actions));
  return proposalMessage;
}

export function generateProposalEmbed(
  proposal: Proposal,
  votes?: Votes,
  actions?: tAction[]
): any {
  const embed: any = {
    description: proposal.description,
    color: 0,
    timestamp: proposal.createdOn.toISOString(),
    footer: {
      text: `Proposal ${proposal.id}`,
    },
    title: proposal.name,
    fields: [
      {
        name: 'Author',
        value: `<@!${proposal.author}>`,
        inline: false,
      },
      {
        name: 'Duration',
        value: getDurationString(proposal.duration),
        inline: false,
      },
    ],
  };
  switch (proposal.status) {
    case ProposalStatus.Building:
      embed.color = ProposalColor.Gray;
      break;
    case ProposalStatus.Running:
      embed.color = ProposalColor.Blue;
      break;
    case ProposalStatus.Passed:
      embed.color = ProposalColor.Green;
      break;
    case ProposalStatus.Failed:
      embed.color = ProposalColor.Red;
      break;
    case ProposalStatus.ExecutionError:
      embed.color = ProposalColor.Orange;
      break;
    case ProposalStatus.Cancelled:
      embed.color = ProposalColor.Black;
      break;
  }

  if (votes) {
    embed.fields.push(
      {
        name: '👍',
        value: votes[Vote.Yes],
        inline: true,
      },
      {
        name: '👎',
        value: votes[Vote.No],
        inline: true,
      }
    );
  }

  if (actions) {
    let actionString = '';
    actions.forEach(
      (action, index) =>
        (actionString = `${actionString}\n${index + 1}. ${actionAsHumanReadable(
          action
        )}`)
    );
    // No empty fields
    if (actionString.length) {
      embed.fields.push({
        name: 'Actions',
        value: actionString,
        inline: false,
      });
    }
  }

  return { embed };
}

function schemaToObj(schema: any): Proposal {
  return {
    author: schema.author_id,
    id: schema.id,
    createdOn: schema.created_on,
    expiresOn: schema.expires_on,
    name: schema.name,
    description: schema.description,
    status: schema.status,
    message: schema.message_id,
    server: schema.server_id,
    channel: schema.channel_id,
    duration: schema.duration,
  };
}

export async function addVote(id: string, userID: string, vote: Vote) {
  // Silently fails if you've already voted
  try {
    await knex
      .insert({
        proposal_id: id,
        user_id: userID,
        vote,
      })
      .into('vote');
  } catch (e) {
    return;
  }
}

export async function clearVote(id: string, userID: string) {
  // Silently fails if you haven't voted
  try {
    await knex
      .table('vote')
      .where('proposal_id', id)
      .andWhere('user_id', userID)
      .delete();
  } catch (e) {
    return;
  }
}

export async function countVotes(
  id: string
): Promise<{ [Vote.Yes]: number; [Vote.No]: number }> {
  const queryResp = await knex
    .select('vote')
    .count('*')
    .from('vote')
    .where('proposal_id', id)
    .groupBy('vote')
    .orderBy('vote', 'desc');
  const yesRow = queryResp.find((row) => row.vote == Vote.Yes);
  const yes = yesRow ? yesRow['count(*)'] : 0;
  const noRow = queryResp.find((row) => row.vote == Vote.No);
  const no = noRow ? noRow['count(*)'] : 0;
  return {
    [Vote.Yes]: yes,
    [Vote.No]: no,
  };
}

export async function createProposal(
  name: string,
  duration: number,
  message: Message
): Promise<Proposal> {
  await knex.table('proposal').insert({
    server_id: message.guild.id,
    author_id: message.author.id,
    expires_on: null,
    duration,
    name,
    description: 'No description provided.',
    status: ProposalStatus.Building,
    message_id: null,
    channel_id: message.channel.id,
  });
  const query = await knex
    .select('*')
    .from('proposal')
    .whereRaw('id = LAST_INSERT_ID()');
  return schemaToObj(query[0]);
}

export async function deleteProposal(id: string) {
  await knex.table('vote').where('proposal_id', id).del();
  await knex.table('action').where('proposal_id', id).del();
  await knex.table('proposal').where('id', id).del();
}

export async function setProposalMessage(id: string, message: Message) {
  await knex
    .table('proposal')
    .update({
      message_id: message.id,
    })
    .where('id', id);
}

export async function setProposalDescription(id: string, description: string) {
  await knex
    .table('proposal')
    .update({
      description,
    })
    .where('id', id);
}

export async function setProposalDuration(id: string, duration: number) {
  await knex
    .table('proposal')
    .update({
      duration,
    })
    .where('id', id);
}

export async function setProposalStatus(id: string, status: ProposalStatus) {
  await knex
    .table('proposal')
    .update({
      status,
    })
    .where('id', id);
}

export async function setExpirationDate(id: string, date: Date) {
  await knex
    .table('proposal')
    .update({
      expires_on: date,
    })
    .where('id', id);
}

// The client doesn't need to be logged in
// The timeout is in milliseconds
export function scheduleProposal(
  client: Client,
  proposal: Proposal,
  timeout: number
) {
  // Setup the interval
  const interval = setTimeout(
    handleProposalExpire,
    timeout,
    client,
    proposal.id
  );
  gIntervalList[proposal.id] = interval;
}

export async function handleProposalExpire(
  client: Client,
  id: string
): Promise<void> {
  delete gIntervalList[id];

  // Tally votes, execute actions if it passes
  const proposal = await getProposal(id);
  const votes = await countVotes(id);
  if (votes[Vote.Yes] > votes[Vote.No]) {
    // Pass, run actions
    const actions = await getActions(id);
    const validation = await validateActions(
      client.guilds.resolve(proposal.server),
      actions
    );
    if (validation !== true) {
      proposal.status = ProposalStatus.ExecutionError;
    } else {
      proposal.status = ProposalStatus.Passed;
      try {
        await executeActions(client.guilds.resolve(proposal.server), actions);
      } catch (e) {
        proposal.status = ProposalStatus.ExecutionError;
        console.warn(e);
      }
    }
  } else {
    proposal.status = ProposalStatus.Failed;
  }
  const newEmbed = await generateProposalEmbed(proposal, votes);
  await setProposalStatus(proposal.id, proposal.status);
  await refreshProposalMessage(client, proposal, newEmbed);
}

export async function getProposal(id: string): Promise<Proposal> {
  const query = await knex.select('*').from('proposal').where('id', id);
  if (query.length < 1) throw new Error(`Proposal ${id} not found`);
  return schemaToObj(query[0]);
}

export async function getHangingProposals(): Promise<Proposal[]> {
  const query = await knex
    .select('*')
    .from('proposal')
    .andWhere('status', ProposalStatus.Running)
    .andWhere('expires_on', '>=', new Date());
  return query.map(schemaToObj);
}

export async function getProposalByMessage(
  messageID: string
): Promise<Proposal> {
  const query = await knex
    .select('*')
    .from('proposal')
    .where('message_id', messageID);
  if (query.length < 1)
    throw new Error(`Proposal with message ID ${messageID} not found`);
  return schemaToObj(query[0]);
}
