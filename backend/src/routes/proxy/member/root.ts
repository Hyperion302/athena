import { Request, Response } from "express";
import { User } from "athena-common";
import { client } from "../../../client";
import "../../../express-shim";

export default async function (req: Request, res: Response) { 
  const serverID = req.params.server;
  const server = await client.guilds.fetch(serverID);

  const limit = parseInt(req.query.limit?.toString()) || 1;
  if (!limit || limit < 0 || limit > 1000) throw { status: 400, error: 'Invalid limit' };
  const query = req.query.query?.toString() || "";
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
