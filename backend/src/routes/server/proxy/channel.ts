import express from "express";
import { Channel, ChannelType } from "athena-common";
import { Request, Response, NextFunction } from "express";
import { client } from "@/client";

async function channelHandler (req: Request, res: Response, next: NextFunction) {
  const serverID = req.params.server;
  const server = await client.guilds.fetch(serverID);

  const channel = server.channels.resolve(req.params.channel);
  if (!channel) return next({ status: 404, message: "Channel not found" });

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

async function rootHandler (req: Request, res: Response) {
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

const router = express.Router({ mergeParams: true });

router.get("/", rootHandler);
router.get("/:channel", channelHandler);

export default router;

