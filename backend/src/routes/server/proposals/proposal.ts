import express from "express";
import { addVote, myVote, getProposal } from "@/proposal";
import { Vote } from "athena-common";
import { Request, Response, NextFunction } from "express";
import { getActions } from "@/action";
import { resolveActions, resolveProposal } from "@/resolver";

async function proposalLookupMiddleware (req: Request, res: Response, next: NextFunction) {
  const proposalID = req.params.proposal;
  try {
    const proposal = await getProposal(proposalID);
    const resolvedProposal = await resolveProposal(res.locals.server, proposal);
    res.locals.proposal = resolvedProposal;
  } catch (ResourceNotFoundError) {
    return next({ status: 404, message: `Proposal ${proposalID} not found` });
  }
  return next();
}

// GET /server/:server/proposal/:proposal
async function rootGetHandler (_0: Request, res: Response, _1: NextFunction) {
  res.status(200).json(res.locals.proposal);
}
// DELETE /server/:server/proposal/:proposal
async function rootDeleteHandler (_0: Request, _1: Response, next: NextFunction) {
  next({ status: 404, message: "Not implemented" });
}
// POST /server/:server/proposal/:proposal/vote
async function votePostHandler (req: Request, res: Response, next: NextFunction) {
  const proposalID = req.params.proposal;
  const userID = res.locals.user.id;
  const vote = parseInt(req.body.vote);
  if (
    vote === undefined ||
    (vote != Vote.Yes &&
    vote != Vote.No &&
    vote != Vote.Abstain)
  ) {
    return next({ status: 400, message: "Invalid vote" });
  }
  await addVote(proposalID, userID, vote);
  const { votes: newTally } = await getProposal(proposalID);
  res.status(200).json(newTally);
}
// GET /server/:server/proposal/:proposal/vote
async function voteGetHandler (req: Request, res: Response) {
  const proposalID = req.params.proposal;
  const userID = res.locals.user.id;
  const vote = await myVote(proposalID, userID);
  res.status(200).json(vote);
}
// GET /server/:server/proposal/:proposal/actions
async function actionsHandler (req: Request, res: Response, next: NextFunction) {
  const proposalID = req.params.proposal;
  const server = res.locals.server;
  const actions = await getActions(proposalID);

  const resolve = req.query.r !== undefined;
  if (resolve) {
    try {
      const resolved = await resolveActions(server, actions);
      res.status(200).json(resolved);
    } catch {
      return next({ status: 500, message: "Failed to resolve all actions" });
    }
  } else {
    res.status(200).json(actions);
  }
}

const router = express.Router({ mergeParams: true });

router.use(proposalLookupMiddleware);
router.get("/", rootGetHandler);
router.delete("/", rootDeleteHandler);
router.get("/vote", voteGetHandler);
router.post("/vote", votePostHandler);
router.get("/actions", actionsHandler);

export default router;

