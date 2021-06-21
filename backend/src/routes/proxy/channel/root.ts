import { Request, Response } from "express";
import { client } from "../../../client";

export default async function (req: Request, res: Response) {
  const serverID = req.params.server;
  const server = await client.guilds.fetch(serverID);

  const [textChannels, channels] = server.channels.cache.partition(channel => channel.type === "text");
  const [voiceChannels, categoryChannels] = channels.partition(channel => channel.type == "voice");

  res.status(200).json({
    text: textChannels.map((channel, key) => ({ id: key, name: channel.name })),
    voice: voiceChannels.map((channel, key) => ({ id: key, name: channel.name })),
    category: categoryChannels.map((channel, key) => ({ id: key, name: channel.name }))
  });
}
