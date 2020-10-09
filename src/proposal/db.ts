import { Proposal, ProposalStatus } from '.';
import { Message } from 'discord.js';
import { knex } from '../db';
import { ResourceNotFoundError } from '../errors/ResourceNotFoundError';
import logger from '../logging';

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
  const proposal = schemaToObj(query[0]);
  logger.info(`Created proposal ${proposal.id}`, proposal);
  return proposal;
}

export async function deleteProposal(id: string) {
  await knex.table('vote').where('proposal_id', id).del();
  await knex.table('action').where('proposal_id', id).del();
  await knex.table('proposal').where('id', id).del();
  logger.info(`Deleted proposal ${id}`, { proposal: id });
}

export async function setProposalMessage(id: string, message: Message) {
  await knex
    .table('proposal')
    .update({
      message_id: message.id,
    })
    .where('id', id);
  logger.info(`Set proposal ${id} message to ${message.id}`, {
    proposal: id,
    message: message.id,
  });
}

export async function setProposalDescription(id: string, description: string) {
  await knex
    .table('proposal')
    .update({
      description,
    })
    .where('id', id);
  logger.info(`Set proposal ${id} description to ${description}`, {
    proposal: id,
    description,
  });
}

export async function setProposalName(id: string, name: string) {
  await knex
    .table('proposal')
    .update({
      name,
    })
    .where('id', id);
  logger.info(`Set proposal ${id} name to ${name}`, {
    proposal: id,
    name,
  });
}

export async function setProposalDuration(id: string, duration: number) {
  await knex
    .table('proposal')
    .update({
      duration,
    })
    .where('id', id);
  logger.info(`Set proposal ${id} duration to ${duration}`, {
    proposal: id,
    duration,
  });
}

export async function setProposalStatus(id: string, status: ProposalStatus) {
  await knex
    .table('proposal')
    .update({
      status,
    })
    .where('id', id);
  logger.info(`Set proposal ${id} status to ${status}`, {
    proposal: id,
    status,
  });
}

export async function setExpirationDate(id: string, date: Date) {
  await knex
    .table('proposal')
    .update({
      expires_on: date,
    })
    .where('id', id);
  logger.info(`Set proposal ${id} expiration date to ${date.getTime()}`, {
    proposal: id,
    date: date.getTime(),
  });
}

export async function getProposal(id: string): Promise<Proposal> {
  const query = await knex.select('*').from('proposal').where('id', id);
  if (query.length < 1) {
    throw new ResourceNotFoundError('proposal', id);
  }
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
  if (query.length < 1) {
    throw new ResourceNotFoundError('proposal', messageID);
  }
  return schemaToObj(query[0]);
}
