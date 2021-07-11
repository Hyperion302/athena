import { 
  Guild,
  Client,
} from "discord.js";
import {
  ResourceReference,
  ReferenceType,
  ResolvedResourceReference,
  tAction,
  tResolvedAction,
  Action,
  Proposal,
  ResolvedProposal,
} from "athena-common";

import { ActionSyntaxError } from "@/errors";
import { Actions } from "@/action";
import { archiveName, checkArchive } from "./db";
import { client } from "@/client";

export type ResolutionList = string[];

function nameToRef(name: string, ref: ResourceReference): ResolvedResourceReference {
  return { type: ReferenceType.Resolved, name, original: ref };
}

export async function resolveServerReference(
  client: Client,
  ref: ResourceReference
): Promise<ResolvedResourceReference> {
  if (ref.type === ReferenceType.ID) {
    const guild = await client.guilds.fetch(ref.id);
    return nameToRef(guild.name, ref);
  }
  throw new ActionSyntaxError(`Unknown server reference type ${ref.type}`);
}

export async function resolveUserReference(
  server: Guild,
  ref: ResourceReference
): Promise<ResolvedResourceReference> {
  if (ref.type == ReferenceType.ID) {
    const user = await server.members.fetch(ref.id);
    if (user) {
      const name = `${user.user.username}#${user.user.discriminator}`
      await archiveName(user.id, name);
      return nameToRef(name, ref);
    } else {
      const result = await checkArchive(ref.id)
      if (result === null) throw new ActionSyntaxError(`Null user reference ${ref.id}`);
      return nameToRef(result.name, ref);
    }
  }
  throw new ActionSyntaxError(`Unknown user reference type ${ref.type}`);
}

export async function resolveChannelReference(
  server: Guild,
  resList: ResolutionList,
  ref: ResourceReference
): Promise<ResolvedResourceReference> {
  if (ref.type == ReferenceType.ID) {
    const channel = server.channels.resolve(ref.id);
    if (channel) {
      await archiveName(channel.id, channel.name);
      return nameToRef(channel.name, ref);
    } else {
      const result = await checkArchive(ref.id)
      if (result === null) throw new ActionSyntaxError(`Null channel reference ${ref.id}`);
      return nameToRef(result.name, ref);
    }
  }
  if (ref.type == ReferenceType.Pointer) {
    const channel = resList[ref.index];
    if (channel === undefined) {
      throw new ActionSyntaxError(`Null channel pointer ${ref.index}`);
    }
    return nameToRef(channel, ref);
  }
  throw new ActionSyntaxError(`Unknown channel reference type ${ref.type}`);
}

export async function resolveRoleReference(
  server: Guild,
  resList: ResolutionList,
  ref: ResourceReference
): Promise<ResolvedResourceReference> {
  if (ref.type == ReferenceType.ID) {
    const role = await server.roles.fetch(ref.id);
    if (role) {
      await archiveName(role.id, role.name);
      return nameToRef(role.name, ref);
    } else {
      const result = await checkArchive(ref.id)
      if (result === null) throw new ActionSyntaxError(`Null role reference ${ref.id}`);
      return nameToRef(result.name, ref);
    }
  }
  if (ref.type == ReferenceType.Pointer) {
    const role = resList[ref.index];
    if (role === undefined) {
      throw new ActionSyntaxError(`Null pointer ${ref.index}`);
    }
    return nameToRef(role, ref);
  }
  throw new ActionSyntaxError(`Unknown role reference type ${ref.type}`);
}

export async function resolveUserOrRoleReference(
  server: Guild,
  resList: ResolutionList,
  ref: ResourceReference
): Promise<ResolvedResourceReference> {
  if (ref.type == ReferenceType.ID) {
    try {
      return await resolveRoleReference(server, resList, ref)
    } catch {
      try {
        return await resolveUserReference(server, ref)
      } catch {
        throw new ActionSyntaxError(`Null role/user reference ${ref.id}`);
      }
    }
  }
  if (ref.type == ReferenceType.Pointer) {
    const role = resList[ref.index];
    if (role === undefined) {
      throw new ActionSyntaxError(`Null role pointer ${ref.index}`);
    }
    return nameToRef(role, ref);
  }
}

export async function resolveActions(
  server: Guild,
  actions: tAction[]
): Promise<tResolvedAction[]> {
  const resList: ResolutionList = [];
  const resolved: tResolvedAction[] = [];

  // For loop for the same reason as in executeActions
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const resolver = Actions.resolvers[action.action];
    const resolvedAction = await resolver(server, action, resList);
    resolved.push(resolvedAction);
    if (
      action.action === Action.CreateRole
      || action.action === Action.CreateChannel
    ) resList.push(action.name);
  }

  return resolved;
}

export async function resolveProposal(
  server: Guild,
  proposal: Proposal
): Promise<ResolvedProposal> {
  return {
    ...proposal,
    author: await resolveUserReference(server, proposal.author),
    server: await resolveServerReference(client, proposal.server)
  }
}

export async function resolveProposals(
  server: Guild,
  proposals: Proposal[]
): Promise<ResolvedProposal[]> {
  return await Promise.all(proposals.map(p => resolveProposal(server, p)));
}
