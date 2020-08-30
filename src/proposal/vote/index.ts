export enum Vote {
  Yes,
  No,
}

export interface Votes {
  [Vote.Yes]: number;
  [Vote.No]: number;
}

export { countVotes, clearVote, addVote } from './db';
