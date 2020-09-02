import { tAction } from '../action';

export const MAX_PROPOSAL_NAME_LENGTH = 256;
export const MIN_PROPOSAL_NAME_LENGTH = 2;
export const MAX_PROPOSAL_DESCRIPTION_LENGTH = 1024;
export const MIN_PROPOSAL_DESCRIPTION_LENGTH = 0;
export const MIN_DURATION = 5;
export const MAX_DURATION = 172800;

export enum Command {
  CreateProposal = 'create proposal',
  CancelProposal = 'cancel proposal',
  DestroyProposal = 'destroy proposal',
  UpdateProposal = 'update proposal',
  RefreshProposal = 'refresh proposal',
  AddAction = 'add action',
  ReplaceAction = 'replace action',
  RemoveAction = 'remove action',
  InsertAction = 'insert action',
  RunProposal = 'run proposal',
  ClearVote = 'clear vote',
  ResendProposal = 'resend proposal',
  RetryProposal = 'retry proposal',
}

interface CreateProposalCommand {
  command: Command.CreateProposal;
  duration: number; // Seconds
  name: string;
  channel: string;
}

interface CancelProposalCommand {
  command: Command.CancelProposal;
  id: string;
}

interface DestroyProposalCommand {
  command: Command.DestroyProposal;
  id: string;
}

interface UpdateProposalCommand {
  command: Command.UpdateProposal;
  id: string;
  field: 'description' | 'duration';
  value: string | number;
}

interface RefreshProposalCommand {
  command: Command.RefreshProposal;
  id: string;
}

interface RunProposalCommand {
  command: Command.RunProposal;
  id: string;
}

interface ClearVoteCommand {
  command: Command.ClearVote;
  id: string;
}

interface AddActionCommand {
  command: Command.AddAction;
  id: string;
  action: tAction;
  actionString: string;
}

interface ReplaceActionCommand {
  command: Command.ReplaceAction;
  id: string;
  index: number;
  action: tAction;
  actionString: string;
}

interface RemoveActionCommand {
  command: Command.RemoveAction;
  id: string;
  index: number;
}

interface InsertActionCommand {
  command: Command.InsertAction;
  id: string;
  index: number;
  action: tAction;
  actionString: string;
}

interface ResendProposalCommand {
  command: Command.ResendProposal;
  id: string;
}

interface RetryProposalCommand {
  command: Command.RetryProposal;
  id: string;
}

// Convenience union type
export type tCommand =
  | CreateProposalCommand
  | CancelProposalCommand
  | DestroyProposalCommand
  | UpdateProposalCommand
  | RefreshProposalCommand
  | RunProposalCommand
  | ClearVoteCommand
  | AddActionCommand
  | ReplaceActionCommand
  | RemoveActionCommand
  | InsertActionCommand
  | ResendProposalCommand
  | RetryProposalCommand;

export { parseCommand } from './parser';
export { executeCommand } from './executor';
