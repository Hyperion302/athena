import * as I from "./interfaces";
import * as C from "./constants";
import * as G from "./guards";

/**
 * Converts common structures/models to strings
 */
export function serialize(obj: I.tAction | I.Proposal | I.Server | I.Votes): string {
  // Handle date objects (Default toString of Date is human readable)
  if (G.isProposal(obj)) {
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
  if (G.isVotes(obj)) {
    const voteArray: number[] = [];
    voteArray[C.Vote.Yes] = obj[C.Vote.Yes];
    voteArray[C.Vote.No] = obj[C.Vote.No];
    voteArray[C.Vote.Abstain] = obj[C.Vote.Abstain];
    return JSON.stringify(voteArray);
  }
  return JSON.stringify(obj);
}
