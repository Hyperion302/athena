import {
  Proposal,
  Vote,
  Votes,
  tResolvedAction,
  NewProposalRequest,
} from "athena-common";
import { drkt, tokenOpts } from "@/services/api";

function apiToObj(api: any): Proposal {
  return {
    id: api.id,
    name: api.name,
    duration: api.duration,
    description: api.description,
    status: api.status,
    server: api.server,
    author: api.author,
    createdOn: new Date(api.createdOn),
    expiresOn: api.expiresOn === null ? null : new Date(api.expiresOn),
  }
}

export async function getRecentProposals(
  server: string,
  token: string,
): Promise<Proposal[]> {
  const results = await drkt.get(`server/${server}/proposal/recent`, {
    ...tokenOpts(token),
    params: { c: 6 }
  });
  return results.data.map(apiToObj);
}

export async function getClosingProposals(
  server: string,
  token: string,
): Promise<Proposal[]> {
  const results = await drkt.get(`server/${server}/proposal/endingSoon`, {
    ...tokenOpts(token),
    params: { c: 6, w: 60 * 60 }
  });
  return results.data.map(apiToObj);
}

export async function getProposal(
  server: string,
  proposal: string,
  token: string,
): Promise<Proposal | null> {
  const result = await drkt.get(`server/${server}/proposal/${proposal}`, tokenOpts(token));
  if (result.status === 404) return null;
  return apiToObj(result.data);
}

export async function getVotes(
  server: string,
  proposal: string,
  token: string,
): Promise<Votes | null> {
  const result = await drkt.get(`server/${server}/proposal/${proposal}/votes`, tokenOpts(token));
  if (result.status === 404) return null;
  return result.data;
}

export async function getMyVote(
  server: string,
  proposal: string,
  token: string,
): Promise<Vote | null> {
  const result = await drkt.get(`server/${server}/proposal/${proposal}/vote`, tokenOpts(token));
  if (result.status === 404) return null;
  return result.data;
}

export async function vote(
  vote: Vote | null,
  server: string,
  proposal: string,
  token: string,
): Promise<Votes | null> {
  const result = await drkt.post(`server/${server}/proposal/${proposal}/vote`,
    { vote },
    tokenOpts(token),
  );
  if (result.status === 404) return null;
  return result.data;
}

export async function getActions(
  server: string,
  proposal: string,
  token: string,
): Promise<tResolvedAction[]> {
  const results = await drkt.get(`server/${server}/proposal/${proposal}/actions`, {
    ...tokenOpts(token),
    params: { r: true }
  });
  if (results.status === 404) return [];
  return results.data;
}


export async function createProposal(
  server: string,
  proposal: NewProposalRequest,
  token: string
): Promise<void> {
  await drkt.post(`server/${server}/proposal`,
    proposal,
    tokenOpts(token)
  );
}
