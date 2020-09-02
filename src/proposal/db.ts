import { Proposal, ProposalStatus } from '.';
import { Message } from 'discord.js';
import { knex } from '../db';
import { ResourceNotFoundError } from '../errors/ResourceNotFoundError';

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
