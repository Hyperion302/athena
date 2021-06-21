import { Proposal, tAction, Server, Votes, Vote } from "./models";
import { isProposal, isVotes } from "./guards";

/**
 * Converts common structures/models to strings
 */
export function serialize(obj: tAction | Proposal | Server | Votes): string {
  // Handle date objects (Default toString of Date is human readable)
  if (isProposal(obj)) {
    const objCopy: any = { ...obj };
    if (obj.createdOn != null) {
      objCopy.createdOn = Math.floor(obj.createdOn.getTime() / 1000);
    }
    if (obj.expiresOn != null) {
      objCopy.expiresOn = Math.floor(obj.expiresOn.getTime() / 1000);
    }
    return JSON.stringify(objCopy);
  }
  // Handle integer keys -> array conversion (JSON doesn't support integer keys)
  if (isVotes(obj)) {
    const voteArray: number[] = [];
    voteArray[Vote.Yes] = obj[Vote.Yes];
    voteArray[Vote.No] = obj[Vote.No];
    voteArray[Vote.Abstain] = obj[Vote.Abstain];
    return JSON.stringify(voteArray);
  }
  return JSON.stringify(obj);
}
