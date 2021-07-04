import { Proposal, ProposalStatus } from "athena-common";
import { Message } from "discord.js";
import { knex } from "../db";
import { ResourceNotFoundError } from "../errors/ResourceNotFoundError";
import logger from "../logging";
import generateSnowflake from "../snowflake";

function schemaToObj(schema: any): Proposal {
  return {
    author: schema.author_id,
    id: schema.id,
    createdOn: schema.created_on === null
      ? schema.created_on
      : new Date(schema.created_on),
    expiresOn: schema.expires_on === null
      ? schema.expires_on
      : new Date(schema.expires_on),
    name: schema.name,
    description: schema.description,
    status: schema.status,
    server: schema.server_id,
    duration: schema.duration,
  };
}

export async function createProposal(
  name: string,
  duration: number,
  description: string,
  server: string,
  author: string,
  status?: ProposalStatus,
): Promise<Proposal> {
  const id = generateSnowflake();
  const expiration = status == ProposalStatus.Running ?
    new Date(Date.now() + duration * 1000)
  : null;
  await knex.table("proposal").insert({
    id,
    server_id: server,
    author_id: author,
    expires_on: expiration, 
    duration,
    name,
    description: description || "",
    created_on: new Date(),
    status: status || ProposalStatus.Building,
  });
  const query = await knex.select("*").from("proposal").where("id", id);
  const proposal = schemaToObj(query[0]);
  logger.info(`Created proposal ${id}`, proposal);
  return proposal;
}

export async function deleteProposal(id: string) {
  await knex.table("vote").where("proposal_id", id).del();
  await knex.table("action").where("proposal_id", id).del();
  await knex.table("proposal").where("id", id).del();
  logger.info(`Deleted proposal ${id}`, { proposal: id });
}

export async function setProposalStatus(id: string, status: ProposalStatus) {
  await knex
    .table("proposal")
    .update({
      status,
    })
    .where("id", id);
  logger.info(`Set proposal ${id} status to ${status}`, {
    proposal: id,
    status,
  });
}


export async function getProposal(id: string): Promise<Proposal> {
  const query = await knex.select("*").from("proposal").where("id", id);
  if (query.length < 1) {
    throw new ResourceNotFoundError("proposal", id);
  }
  return schemaToObj(query[0]);
}

export async function getProposals(server: string, count: number, start: number): Promise<Proposal[]> {
  const query = await knex
    .select("*")
    .from("proposal")
    .where("server_id", server)
    .andWhere("id", ">", start)
    .orderBy("id", "asc")
    .limit(count)
  return query.map(schemaToObj);
}

export async function getRecentProposals(server: string, count: number): Promise<Proposal[]> {
  const query = await knex
    .select("*")
    .from("proposal")
    .where("server_id", server)
    .orderBy("id", "desc") // Youngest first
    .limit(count)
  return query.map(schemaToObj);
}

export async function getEndingProposals(server: string, within: number, count: number): Promise<Proposal[]> {
  const query = await knex
    .select("*")
    .from("proposal")
    .where("server_id", server)
    .andWhere("status", ProposalStatus.Running)
    .andWhere("expires_on", "<", new Date(Date.now() + within * 1000))
    .orderBy("id", "asc") // Oldest first
    .limit(count)
  return query.map(schemaToObj);
}

export async function getHangingProposals(): Promise<Proposal[]> {
  const query = await knex
    .select("*")
    .from("proposal")
    .andWhere("status", ProposalStatus.Running)
    .andWhere("expires_on", ">=", new Date());
  return query.map(schemaToObj);
}
