import { Proposal, ProposalStatus, ReferenceType, Vote } from "athena-common";
import { knex } from "@/db";
import { ResourceNotFoundError } from "@/errors/ResourceNotFoundError";
import logger from "@/logging";
import generateSnowflake from "@/snowflake";

function schemaToObj(schema: any): Proposal {
  return {
    id: schema.id,
    author: { type: ReferenceType.ID, id: schema.author_id },
    server: { type: ReferenceType.ID, id: schema.server_id },
    createdOn: schema.created_on === null
      ? schema.created_on
      : new Date(schema.created_on),
    expiresOn: schema.expires_on === null
      ? schema.expires_on
      : new Date(schema.expires_on),
    name: schema.name,
    description: schema.description,
    status: schema.status,
    duration: schema.duration,
    votes: {
      [Vote.Yes]: schema["count(`y`.`vote`)"],
      [Vote.No]: schema["count(`n`.`vote`)"],
      [Vote.Abstain]: schema["count(`a`.`vote`)"]
    }
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
  const newProposal = await getProposal(id);
  logger.info(`Created proposal ${id}`, newProposal);
  return newProposal;
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

const baseQuery = () => knex
    .select(
      "proposal.id",
      "proposal.author_id",
      "proposal.server_id",
      "proposal.created_on",
      "proposal.expires_on",
      "proposal.duration",
      "proposal.name",
      "proposal.description",
      "proposal.status",
    )
    .count("y.vote")
    .count("n.vote")
    .count("a.vote")
    .from("proposal")
    .leftJoin("vote as y", (j) => {
      j
        .on("proposal.id", "=", "y.proposal_id")
        .andOn("y.vote", "=", knex.raw(Vote.Yes.toString()))
    })
    .leftJoin("vote as n", (j) => {
      j
        .on("proposal.id", "=", "n.proposal_id")
        .andOn("n.vote", "=", knex.raw(Vote.No.toString()))
    })
    .leftJoin("vote as a", (j) => {
      j
        .on("proposal.id", "=", "a.proposal_id")
        .andOn("a.vote", "=", knex.raw(Vote.Abstain.toString()))
    });

export async function getProposal(id: string): Promise<Proposal> {
  // const query = await knex.select("*").from("proposal").where("id", id);
  const query = await baseQuery()
    .where("proposal.id", "=", id);
  if (query.length < 1) {
    throw new ResourceNotFoundError("proposal", id);
  }
  return schemaToObj(query[0]);
}

export async function getProposals(server: string, count: number, start: string): Promise<Proposal[]> {
  const query = await baseQuery() 
    .where("proposal.server_id", server)
    .andWhere("proposal.id", ">", start)
    .groupBy("proposal.id")
    .orderBy("proposal.id", "asc")
    .limit(count)
  return query.map(schemaToObj);
}

export async function getRecentProposals(server: string, count: number): Promise<Proposal[]> {
  const query = await baseQuery()
    .where("proposal.server_id", server)
    .groupBy("proposal.id")
    .orderBy("proposal.id", "desc")
    .limit(count)
  return query.map(schemaToObj);
}

export async function getEndingProposals(server: string, within: number, count: number): Promise<Proposal[]> {
  const query = await baseQuery()
    .where("proposal.server_id", server)
    .andWhere("proposal.status", ProposalStatus.Running)
    .andWhere("proposal.expires_on", "<", new Date(Date.now() + within * 1000))
    .groupBy("proposal.id")
    .orderBy("proposal.id", "asc") // Oldest first
    .limit(count)
  return query.map(schemaToObj);
}

export async function getHangingProposals(): Promise<Proposal[]> {
  const query = await baseQuery()
    .where("proposal.status", ProposalStatus.Running)
    .andWhere("proposal.expires_on", ">=", new Date())
    .groupBy("proposal.id")
  return query.map(schemaToObj);
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
    // If you already voted, try updating your vote
    logger.debug(`${userID} might have already voted, trying to update`);
    try {
      await knex
        .table('vote')
        .where('proposal_id', id)
        .andWhere('user_id', userID)
        .update({
          vote,
        });
    } catch (e) {
      logger.warn(
        `Couldn't update vote or create vote for ${userID}: `,
        e
      );
      return;
    }
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

export async function myVote(id: string, userID: string): Promise<Vote | null> {
  const query = await knex
    .select("vote")
    .from("vote")
    .where("proposal_id", id)
    .andWhere("user_id", userID);
  if (query.length < 1) return null;
  return query[0].vote;
}
