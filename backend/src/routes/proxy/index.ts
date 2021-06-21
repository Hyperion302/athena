import express from 'express';
import { client } from "../../client";
import channelHandler from "./channel";
import memberHandler from "./member";
import roleHandler from "./role";

const router = express.Router();
// Server membership check
router.use("/:server", async (req, res, next) => {
  // Get server
  const serverID = req.params.server;
  if (!serverID) next({ status: 400, message: "Invalid server" });
  const server = await client.guilds.fetch(serverID);
  if (!server) next({ status: 404, message: "Server not found" });

  // Make sure caller is in server
  const userID = req.user;
  const user = await server.members.fetch(userID);
  if (!user) return next({ status: 403, message: "Must be a member of given server" });
  next();
});
router.use("/:server/channel", channelHandler);
router.use("/:server/member", memberHandler);
router.use("/:server/role", roleHandler);

export default router;
