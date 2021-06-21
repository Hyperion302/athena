import logger from '../../logging';
import { Vote } from '.';
import { knex } from '../../db';

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
        `Unknown error occured (couldn't update vote or create vote) for ${userID}: `,
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

export async function countVotes(
  id: string
): Promise<{ [Vote.Yes]: number; [Vote.No]: number; [Vote.Abstain]: number }> {
  const queryResp = await knex
    .select('vote')
    .count('*')
    .from('vote')
    .where('proposal_id', id)
    .groupBy('vote')
    .orderBy('vote', 'desc');
  const yesRow = queryResp.find((row) => row.vote == Vote.Yes);
  const yes = yesRow ? yesRow['count(*)'] : 0;
  const noRow = queryResp.find((row) => row.vote == Vote.No);
  const no = noRow ? noRow['count(*)'] : 0;
  const abstainRow = queryResp.find((row) => row.vote == Vote.Abstain);
  const abstain = abstainRow ? abstainRow['count(*)'] : 0;
  return {
    [Vote.Yes]: yes,
    [Vote.No]: no,
    [Vote.Abstain]: abstain,
  };
}
