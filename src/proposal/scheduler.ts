// The client doesn't need to be logged in

import { Client } from 'discord.js';
import { Proposal, ProposalStatus } from '.';
import { getProposal, setProposalStatus } from './db';
import { countVotes, Vote } from './vote';
import { getActions, executeActions, validateActions } from '../action';
import { generateProposalEmbed, refreshProposalMessage } from './renderer';

export const gIntervalList: {
  [key: string]: NodeJS.Timeout;
} = {};

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
