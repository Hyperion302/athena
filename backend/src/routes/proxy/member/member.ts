import {User} from "athena-common";
import { Request, Response } from "express";
import { client } from "../../../client";
import "../../../express-shim";

export default async function (req: Request, res: Response) {
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
