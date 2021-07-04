import express from "express"
import { Request, Response, NextFunction } from "express";
import { Role } from "athena-common";
import { client } from "@/client";

async function roleHandler (req: Request, res: Response, next: NextFunction) {
  const serverID = req.params.server;
  const server = await client.guilds.fetch(serverID);


  const role = await server.roles.fetch(req.params.role);
  if (!role) return next({ status: 404, message: "Role not found" });

  const returnedRole: Role = {
    id: role.id,
    name: role.name,
    position: role.position,
    hoist: role.hoist
  }
  res.status(200).json(returnedRole);
}

async function rootHandler (req: Request, res: Response) {
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

const router = express.Router({ mergeParams: true });

router.get("/", rootHandler);
router.get("/:role", roleHandler);

export default router;

