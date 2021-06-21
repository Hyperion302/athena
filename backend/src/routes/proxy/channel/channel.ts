import {Channel, ChannelType} from "athena-common";
import { Request, Response } from "express";
import { client } from "../../../client";

export default async function (req: Request, res: Response) {
  const serverID = req.params.server;
  const server = await client.guilds.fetch(serverID);

  const channel = server.channels.resolve(req.params.channel);
  if (!channel) throw { status: 404, message: "Channel not found" };

  let type: ChannelType | null = null;
  switch(channel.type) {
    case "text": type = ChannelType.Text;
    case "voice": type = ChannelType.Voice;
    case "category": type = ChannelType.Category;
  }

  const returnedChannel: Channel = {
    id: channel.id,
    name: channel.name,
    type
  }
  res.status(200).json(returnedChannel);
}
