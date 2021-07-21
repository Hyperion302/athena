import * as I from "./interfaces";
import * as C from "./constants";

export function isProposal(obj: any): obj is I.Proposal {
  return obj.author !== undefined;
}

export function isAction(obj: any): obj is I.tAction {
  return obj.type !== undefined;
}

export function isVotes(obj: any): obj is I.Votes {
  return (
    obj[C.Vote.Yes] !== undefined &&
    obj[C.Vote.No] !== undefined &&
    obj[C.Vote.Abstain] !== undefined
  );
}
