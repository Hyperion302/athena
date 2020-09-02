// Gets a single action

import { tAction, parseAction } from '.';
import { knex } from '../db';
import { ResourceNotFoundError } from '../errors/ResourceNotFoundError';

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
  return parseAction(queryResults[0].action_string);
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
    actionList[actionRow.id] = parseAction(actionRow.action_string);
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
  actionString: string
): Promise<number> {
  await knex
    .insert({
      id: index,
      proposal_id: proposal,
      action_string: actionString,
    })
    .into('action');
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
}
