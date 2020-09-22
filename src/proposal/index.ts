export enum ProposalStatus {
  Building,
  Running,
  Cancelled,
  Passed,
  Failed,
  ExecutionError,
}

export enum ProposalColor {
  Gray = 10197915,
  Blue = 4886754,
  Green = 8311585,
  Red = 13632027,
  Black = 1,
  Orange = 14786870,
}

export interface Proposal {
  author: string;
  id: string;
  createdOn: Date;
  expiresOn: Date;
  duration: number;
  name: string;
  description: string;
  status: ProposalStatus;
  message: string;
  server: string;
  channel: string;
}

export {
  gIntervalList,
  scheduleProposal,
  handleProposalExpire,
} from './scheduler';
export {
  refreshProposalMessage,
  generateProposalEmbed,
  getMessageObject,
} from './renderer';
export {
  getProposal,
  createProposal,
  deleteProposal,
  setProposalMessage,
  setProposalStatus,
  setProposalDescription,
  setProposalDuration,
  setExpirationDate,
  getProposalByMessage,
  getHangingProposals,
} from './db';
export { clearVote, addVote, countVotes, Vote, Votes } from './vote';
