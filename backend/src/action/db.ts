// Gets a single action

import { knex } from '@/db';
import { ResourceNotFoundError } from "@/errors";
import { tAction } from "athena-common";
import logger from '@/logging';

// NOTE: Does NOT validate the action once retrieved
export async function getAction(
  proposal: string,
  index: number
): Promise<tAction> {
  const queryResults = await knex
    .select('*')
    .from('action')
    .where('proposal_id', proposal)
    .andWhere('id', index);
  if (queryResults.length < 1) {
    throw new ResourceNotFoundError('action', index.toString());
  }
  logger.info(queryResults[0].action_data);
  return queryResults[0].action_data;
}

// Gets all actions on a proposal
// NOTE: Does NOT validate retrieved actions
export async function getActions(proposal: string): Promise<tAction[]> {
  const queryResults = await knex
    .select('*')
    .from('action')
    .where('proposal_id', proposal);
  const actionList: tAction[] = [];
  queryResults.forEach((actionRow) => {
    actionList[actionRow.id] = actionRow.action_data;
  });
  return actionList;
}

export async function getNextIndex(proposal: string) {
  let newIndex = 0;
  // Get the highest index stored
  const indexes = await knex
    .select('id')
    .from('action')
    .where('proposal_id', proposal);
  if (indexes.length) {
    const sortedIndexes = indexes
      .map((index) => index.id)
      .sort((a, b) => a - b);
    newIndex = sortedIndexes.pop() + 1;
  }
  return newIndex;
}

// Creates an action
// NOTE: Does NOT validate action before creating
export async function createAction(
  proposal: string,
  index: number,
  action: tAction
): Promise<number> {
  await knex
    .insert({
      id: index,
      proposal_id: proposal,
      action_data: action,
    })
    .into('action');
  logger.info(`Created action ${index} on ${proposal}`, {
    proposal,
    index,
    action,
  });
  return index;
}

// Replaces a single action
// NOTE: Does NOT revalidate the action list
export async function replaceAction(
  proposal: string,
  index: number,
  newActionString: string
): Promise<void> {
  await knex
    .table('action')
    .update({ action_string: newActionString })
    .where('proposal_id', proposal)
    .andWhere('id', index);
  logger.info(
    `Replaced action ${index} on ${proposal} with ${newActionString}`,
    { index, proposal, newActionString }
  );
}

// Deletes an action and adjusts all indexes
// NOTE: Does NOT revalidate the action list
export async function removeAction(
  proposal: string,
  index: number
): Promise<void> {
  await knex
    .table('action')
    .where('proposal_id', proposal)
    .andWhere('id', index)
    .del();
  // Fill hole
  await knex
    .table('action')
    .decrement('id')
    .where('proposal_id', proposal)
    .andWhere('id', '>', index)
    .orderBy('id', 'asc');
  logger.info(`Removed action ${index} on ${proposal}`, { index, proposal });
}

// Inserts an action and adjusts all indexes
// NOTE: Does NOT revalidate the action list
export async function insertAction(
  proposal: string,
  index: number,
  actionString: string
) {
  // Shift up
  await knex
    .table('action')
    .increment('id')
    .where('proposal_id', proposal)
    .andWhere('id', '>=', index)
    .orderBy('id', 'desc');
  await knex
    .insert({
      id: index,
      proposal_id: proposal,
      action_string: actionString,
    })
    .into('action');
  logger.info(`Inserted action ${index} on ${proposal}: ${actionString}`, {
    index,
    proposal,
    actionString,
  });
}
