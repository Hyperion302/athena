import { Client, Message, TextChannel } from 'discord.js';
import { Proposal, ProposalStatus, ProposalColor } from '.';
import { Votes, countVotes, Vote } from './vote';
import {
  tAction,
  getActions,
  renderAction,
  renderDurationString,
} from '../action';

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
        value: renderDurationString(proposal.duration),
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
        (actionString = `${actionString}\n${index + 1}. ${renderAction(
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
