import {Role} from "athena-common";
import { Request, Response } from "express";
import { client } from "../../../client";

export default async function (req: Request, res: Response) {
  const serverID = req.params.server;
  const server = await client.guilds.fetch(serverID);


  const role = await server.roles.fetch(req.params.role);
  if (!role) throw { status: 404, message: "Role not found" };

  const returnedRole: Role = {
    id: role.id,
    name: role.name,
    position: role.position,
    hoist: role.hoist
  }
  res.status(200).json(returnedRole);
}

