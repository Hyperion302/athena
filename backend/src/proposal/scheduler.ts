// The client doesn't need to be logged in

import { Client } from 'discord.js';
import { Proposal, ProposalStatus } from 'athena-common';
import { getProposal, setProposalStatus } from '@/proposal/db';
import { countVotes, Vote } from '@/proposal/vote';
import { getActions, executeActions, validateActions } from '@/action';

import logger from '@/logging';

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
  const interval = client.setTimeout(
    handleProposalExpire,
    timeout,
    client,
    proposal.id
  );
  gIntervalList[proposal.id] = interval;
  logger.info(
    `Scheduled proposal ${proposal.id} to execute in ${timeout} milliseconds`,
    { proposal: proposal.id, timeout }
  );
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
    logger.info(
      `Proposal ${proposal.id} passed ${votes[Vote.Yes]} to ${votes[Vote.No]}`,
      { proposal: proposal.id, votes }
    );
    const actions = await getActions(id);
    const actionsValidation = await validateActions(
      client.guilds.resolve(proposal.server),
      actions
    );
    if (!actionsValidation.valid) {
      proposal.status = ProposalStatus.ExecutionError;
      logger.info(
        `Execution failed because proposal ${proposal.id} could not be verified`,
        { actionsValidation }
      );
    } else {
      proposal.status = ProposalStatus.Passed;
      try {
        await executeActions(client.guilds.resolve(proposal.server), actions);
      } catch (e) {
        proposal.status = ProposalStatus.ExecutionError;
        logger.info(`Proposal execution error: `, e);
      }
    }
  } else {
    logger.info(
      `Proposal ${proposal.id} failed ${votes[Vote.Yes]} to ${votes[Vote.No]}`,
      { proposal: proposal.id, votes }
    );
    proposal.status = ProposalStatus.Failed;
  }
  await setProposalStatus(proposal.id, proposal.status);
}
