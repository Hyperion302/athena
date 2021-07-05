import express from "express";
import proposalHandler from "@/routes/server/proposals/proposal";
import { getProposals, createProposal, getRecentProposals, getEndingProposals, scheduleProposal } from "@/proposal";
import { Request, Response, NextFunction } from "express";
import logger from "@/logging";
import {
  ProposalStatus,
  PROPOSAL_NAME_MIN,
  PROPOSAL_NAME_MAX,
  PROPOSAL_DURATION_MIN,
  PROPOSAL_DURATION_MAX,
  PROPOSAL_DESCRIPTION_MAX,
  PROPOSAL_DESCRIPTION_MIN,
  NewProposalRequest,
} from "athena-common";
import { client } from "@/client";
import {createAction, validateAction, validateActions} from "@/action";

// GET /server/:server/proposal/
async function rootGetHandler (req: Request, res: Response, next: NextFunction): Promise<void> { 
  const serverID = req.params.server;

  const count = parseInt(<any>req.query.c) || 1;
  if (
    isNaN(count)
    || count <= 0
    || count > 1000
  ) return next({ status: 400, message: "Invalid count" });
  // FIXME: Known bug, using a normal javascript number to hold start will
  // inevitably cause overflow issues.  It should be a string, but if we pass
  // knex a string SQL will not cast the id column to a number during the 
  // comparison. :/
  const start = parseInt(<any>req.query.s) || 0;
  if (
    isNaN(start)
    || start < 0
  ) return next({ status: 400, message: "Invalid start" });

  const proposals = await getProposals(serverID, count, start);
  res.status(200).json(proposals);
}

// POST /server/:server/proposal/
async function rootPostHandler (req: Request, res: Response, next: NextFunction): Promise<void> {
  const serverID = req.params.server;
  const server = await client.guilds.fetch(serverID);
  const userID = res.locals.user.id;

  const body: NewProposalRequest = req.body;
  // Validate input
  const name = body.name;
  if (
    name === undefined
    || typeof name !== "string"
    || name.length < PROPOSAL_NAME_MIN
    || name.length > PROPOSAL_NAME_MAX
  ) return next({ status: 400, message: "Invalid name" });

  const description = body.description
  if (
    description === undefined
    || typeof description !== "string"
    || description.length < PROPOSAL_DESCRIPTION_MIN
    || description.length > PROPOSAL_DESCRIPTION_MAX
  ) return next({ status: 400, message: "Invalid description" });

  const duration = Math.abs(body.duration);
  if (
    isNaN(duration)
    || typeof duration !== "number"
    || duration < PROPOSAL_DURATION_MIN
    || duration > PROPOSAL_DURATION_MAX
  ) return next({ status: 400, message: "Invalid duration" });

  const actions = body.actions;
  if (
    actions === undefined
    || !Array.isArray(actions)
  ) return next({ status: 400, message: "Missing actions list"});
  const validationResult = await validateActions(server, actions);
  if (!validationResult.valid) return next({ status: 400, message: "An action is invalid" });

  // Create proposal
  const createdProposal = await createProposal(
    name,
    duration,
    description,
    serverID,
    userID,
    ProposalStatus.Running
  );

  // Create actions
  // Must come before scheduling to gurantee actions are stored before scheduling
  const actionCreationPromises = actions.map((a, i) => createAction(createdProposal.id, i, a));
  const createdActions = await Promise.all(actionCreationPromises);

  // Schedule proposal
  scheduleProposal(client, createdProposal, duration * 1000);

  res.status(201).json({ proposal: createdProposal, actions: createdActions });
}

// GET /server/:server/proposal/recent
async function recentHandler (req: Request, res: Response, next: NextFunction): Promise<void> {
  const serverID = req.params.server;
  
  const count = parseInt(req.query.c?.toString()) || 1;
  if (count <= 0 || count > 1000) return next({ status: 400, message: "Invalid count" });

  const proposals = await getRecentProposals(serverID, count);
  res.status(200).json(proposals);
}
// GET /server/:server/proposal/endingSoon
async function endingSoonHandler (req: Request, res: Response, next: NextFunction): Promise<void> {
  const serverID = req.params.server;
  
  const count = parseInt(req.query.c?.toString()) || 1;
  if (count === undefined
    || count <= 0
    || count > 1000
  ) return next({ status: 400, message: "Invalid count" });
  const within = parseInt(req.query.w?.toString()) || 1;
  if (within === undefined
    || within <= 0
    || within > 86400
  ) return next({ status: 400, message: "Invalid within" });

  const proposals = await getEndingProposals(serverID, within, count);
  res.status(200).json(proposals);
}

const router = express.Router({ mergeParams: true });

router.get("/", rootGetHandler);
router.post("/", rootPostHandler);
router.get("/recent", recentHandler);
router.get("/endingSoon", endingSoonHandler);
router.use("/:proposal", proposalHandler);

export default router;

