import express from "express";
import { addVote, countVotes, getProposal } from "@/proposal";
import { Vote } from "athena-common";
import { Request, Response, NextFunction } from "express";
import {myVote} from "@/proposal/vote/db";
import {getActions} from "@/action";

async function proposalLookupMiddleware (req: Request, res: Response, next: NextFunction) {
  const proposalID = req.params.proposal;
  try {
    const proposal = await getProposal(proposalID);
    res.locals.proposal = proposal;
  } catch (ResourceNotFoundError) {
    return next({ status: 404, message: `Proposal ${proposalID} not found` });
  }
  return next();
}

// GET /server/:server/proposal/:proposal
async function rootGetHandler (req: Request, res: Response, next: NextFunction) {
  res.status(200).json(res.locals.proposal);
}
// DELETE /server/:server/proposal/:proposal
async function rootDeleteHandler (req: Request, res: Response, next: NextFunction) {
  next({ status: 404, message: "Not implemented" });
}
// GET /server/:server/proposal/:proposal/votes
async function votesHandler (req: Request, res: Response, next: NextFunction) {
  const proposalID = req.params.proposal;
  const votes = await countVotes(proposalID);
  res.status(200).json(votes);
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
  const newTally = await countVotes(proposalID);
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
async function actionsHandler (req: Request, res: Response) {
  const proposalID = req.params.proposal;
  const actions = await getActions(proposalID);
  res.status(200).json(actions);
}

const router = express.Router({ mergeParams: true });

router.use(proposalLookupMiddleware);
router.get("/", rootGetHandler);
router.delete("/", rootDeleteHandler);
router.get("/vote", voteGetHandler);
router.post("/vote", votePostHandler);
router.get("/votes", votesHandler);
router.get("/actions", actionsHandler);

export default router;

