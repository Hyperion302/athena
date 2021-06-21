import { Proposal, tAction, Votes, Vote } from "./models";

export function isProposal(obj: any): obj is Proposal {
  return obj.author !== undefined;
}

export function isAction(obj: any): obj is tAction {
  return obj.type !== undefined;
}

export function isVotes(obj: any): obj is Votes {
  return (
    obj[Vote.Yes] !== undefined &&
    obj[Vote.No] !== undefined &&
    obj[Vote.Abstain] !== undefined
  );
}
