import {Role} from "athena-common";
import { Request, Response } from "express";
import { client } from "../../../client";

export default async function (req: Request, res: Response) {
  const serverID = req.params.server;
  const server = await client.guilds.fetch(serverID);

  const roles = await server.roles.fetch();
  res.status(200).json(roles.cache.map((role, key): Role => {
    return {
      id: key,
      name: role.name,
      position: role.position,
      hoist: role.hoist
    };
  }));
}

