export enum Vote {
  Yes,
  No,
  Abstain,
}

export interface Votes {
  [Vote.Yes]: number;
  [Vote.No]: number;
  [Vote.Abstain]: number;
}

export { countVotes, clearVote, addVote } from './db';
