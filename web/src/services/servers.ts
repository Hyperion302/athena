import { Server } from "athena-common";
import { discord, drkt, tokenOpts } from "@/services/api";

export async function getServers(token: string): Promise<Server[]> {
  const results = await discord.get("users/@me/guilds", tokenOpts(token));
  return results.data.map((raw: any) => ({
    id: raw.id,
    name: raw.name,
    icon: raw.icon,
  }));
}

export async function filterServers(token: string, servers: Server[]): Promise<Server[]> {
  const results = await drkt.get("server", {
    ...tokenOpts(token),
    params: {
      servers: servers.map((server) => server.id)
    }
  });
  return servers.filter(val => results.data.indexOf(val.id) >= 0);
}
