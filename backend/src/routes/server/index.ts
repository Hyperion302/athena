import express from "express";
import proposalHandler from "@/routes/server/proposals";
import proxyHandler from "@/routes/server/proxy";
import { Request, Response } from "express";
import { client } from "@/client";

// GET /server
async function rootHandler (req: Request, res: Response): Promise<void> {
  const serverIDs = <string[]>req.query.servers;
  if (serverIDs.length > 200) throw { status: 401, message: 'Too many servers' };

  const filteredServers = serverIDs.filter((serverID) => client.guilds.resolve(serverID) !== null);
  res.status(200).json(filteredServers);
}

const router = express.Router();

router.get("/", rootHandler);

// Check server membership
router.use("/:server", async (req, res, next) => {
  // Get server
  const serverID = req.params.server;
  if (!serverID) next({ status: 400, message: "Invalid server" });
  const server = await client.guilds.fetch(serverID);
  if (!server) next({ status: 404, message: "Server not found" });

  // Make sure caller is in server
  const userID = res.locals.user;
  const user = await server.members.fetch(userID);
  if (!user) return next({ status: 403, message: "Must be a member of given server" });
  next();
});
router.use("/:server/proposal", proposalHandler);
router.use("/:server/proxy", proxyHandler);

export default router;

