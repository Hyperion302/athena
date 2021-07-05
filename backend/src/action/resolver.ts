import { 
  Guild,
} from "discord.js";
import {
  ResourceReference,
  ReferenceType,
  ResolvedResourceReference,
  tAction,
  tResolvedAction,
  Action,
} from "athena-common";

import { ActionSyntaxError } from "@/errors";
import { resolvers } from "./actions";
import {archiveName, checkArchive} from "./db";

export type ResolutionList = string[];

export function nameToRef(name: string): ResolvedResourceReference {
  return { type: ReferenceType.Resolved, name };
}

export async function resolveUserReference(
  server: Guild,
  ref: ResourceReference
): Promise<string> {
  if (ref.type == ReferenceType.ID) {
    const user = await server.members.fetch(ref.id);
    if (user) {
      const name = `${user.user.username}#${user.user.discriminator}`
      await archiveName(user.id, name);
      return name;
    } else {
      const result = await checkArchive(ref.id)
      if (result === null) throw new ActionSyntaxError(`Null user reference ${ref.id}`);
      return result.name;
    }
  }
  throw new ActionSyntaxError(`Unknown user reference type ${ref.type}`);
}

export async function resolveChannelReference(
  server: Guild,
  resList: ResolutionList,
  ref: ResourceReference
): Promise<string> {
  if (ref.type == ReferenceType.ID) {
    const channel = server.channels.resolve(ref.id);
    if (channel) {
      await archiveName(channel.id, channel.name);
      return channel.name;
    } else {
      const result = await checkArchive(ref.id)
      if (result === null) throw new ActionSyntaxError(`Null channel reference ${ref.id}`);
      return result.name;
    }
  }
  if (ref.type == ReferenceType.Pointer) {
    const channel = resList[ref.index];
    if (channel === undefined) {
      throw new ActionSyntaxError(`Null channel pointer ${ref.index}`);
    }
    return channel;
  }
  throw new ActionSyntaxError(`Unknown channel reference type ${ref.type}`);
}

export async function resolveRoleReference(
  server: Guild,
  resList: ResolutionList,
  ref: ResourceReference
): Promise<string> {
  if (ref.type == ReferenceType.ID) {
    const role = await server.roles.fetch(ref.id);
    if (role) {
      await archiveName(role.id, role.name);
      return role.name;
    } else {
      const result = await checkArchive(ref.id)
      if (result === null) throw new ActionSyntaxError(`Null role reference ${ref.id}`);
      return result.name;
    }
  }
  if (ref.type == ReferenceType.Pointer) {
    const role = resList[ref.index];
    if (role === undefined) {
      throw new ActionSyntaxError(`Null pointer ${ref.index}`);
    }
    return role;
  }
  throw new ActionSyntaxError(`Unknown role reference type ${ref.type}`);
}

export async function resolveUserOrRoleReference(
  server: Guild,
  resList: ResolutionList,
  ref: ResourceReference
): Promise<string> {
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
    return role;
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
    const resolver = resolvers[action.action];
    const resolvedAction = await resolver(server, action, resList);
    resolved.push(resolvedAction);
    if (
      action.action === Action.CreateRole
      || action.action === Action.CreateChannel
    ) resList.push(action.name);
  }

  return resolved;
}
