import { Request, Response } from "express";
import { client } from "../../client";

export default async function (req: Request, res: Response): Promise<void> {
  const serverIDs = <string[]>req.query.servers;
  if (serverIDs.length > 200) throw { status: 401, message: 'Too many servers' };

  const filteredServers = serverIDs.filter((serverID) => client.guilds.resolve(serverID) !== null);
  res.status(200).json(filteredServers);
}
