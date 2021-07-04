import express from "express"
import { Request, Response } from "express";
import {User} from "athena-common";
import { client } from "@/client";

async function memberHandler (req: Request, res: Response) {
  const serverID = req.params.server;
  const server = await client.guilds.fetch(serverID);

  const member = await server.members.fetch(req.params.member);
  if (!member) throw { status: 404, error: 'Member not found' };

  const user: User = {
    id: member.id,
    username: member.user.username,
    discriminator: member.user.discriminator,
    avatar: member.user.avatar
  }

  res.status(200).json(user);
}

async function rootHandler (req: Request, res: Response) { 
  const serverID = req.params.server;
  const server = await client.guilds.fetch(serverID);

  const limit = parseInt(req.query.l?.toString()) || 1;
  if (!limit || limit < 0 || limit > 1000) throw { status: 400, error: 'Invalid limit' };
  const query = req.query.q?.toString() || "";
  if (!query) throw { status: 400, error: 'Invalid query' };
 
  // All members
  const membersCollection = await server.members.fetch({ query, limit });
  const members = membersCollection.map((member, key): User => {
    return {
      id: key,
      username: member.user.username,
      discriminator: member.user.discriminator,
      avatar: member.user.avatar
    };
  });
  res.status(200).json(members);
  /*
  .sort((a, b) => {
    const bA = BigInt(a.id)
    const bB = BigInt(b.id)
    return (bA < bB) ? -1 : ((bA > bB) ? 1 : 0);
  });
  // Paginate
  if (after === "0") {
    return res.status(200).json(members.slice(0, limit));
  }
  const startPoint = members.findIndex((member) => member.id === after);
  if (startPoint === -1) throw { status: 400, error: 'After not found' };
  let endpoint = startPoint + 1 + limit; // Add one since after is the ID of an already delivered user
  if (endpoint > members.length) endpoint = members.length;
  res.status(200).json(members.slice(startPoint + 1, endpoint));*/
}

const router = express.Router({ mergeParams: true });

router.get("/", rootHandler);
router.get("/:member", memberHandler);

export default router;

