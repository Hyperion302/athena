import {
  Guild,
  Channel,
  Role,
  GuildMember,
  GuildChannel,
} from 'discord.js';
import { permissions } from "athena-common";
import {
  ResourceReference,
  ReferenceType,
  tAction,
} from "athena-common";
import { ActionSyntaxError } from '@/errors';
import { executors } from '@/action/actions';

export type ResourceList = (Channel | Role)[];

export function unwrapPermission(permission: number): string[] {
  return permissions.filter((p) => p.id & permission).map((p) => p.djs);
}

export async function resolveUserReference(
  server: Guild,
  ref: ResourceReference
): Promise<GuildMember> {
  if (ref.type == ReferenceType.ID) {
    const user = await server.members.fetch(ref.id);
    if (!user) throw new ActionSyntaxError(`Null user reference ${ref.id}`);
    return user;
  }
  throw new ActionSyntaxError(`Unknown user reference type ${ref.type}`);
}

export async function resolveChannelReference(
  server: Guild,
  resourceList: ResourceList,
  ref: ResourceReference
): Promise<GuildChannel> {
  if (ref.type == ReferenceType.ID) {
    const channel = server.channels.resolve(ref.id);
    if (!channel) {
      throw new ActionSyntaxError(`Null channel reference ${ref.id}`);
    }
    return channel;
  }
  if (ref.type == ReferenceType.Pointer) {
    const channel = resourceList[ref.index];
    if (!(channel instanceof GuildChannel) || !channel) {
      throw new ActionSyntaxError(`Null channel pointer ${ref.index}`);
    }
    return channel;
  }
  throw new ActionSyntaxError(`Unknown channel reference type ${ref.type}`);
}

export async function resolveRoleReference(
  server: Guild,
  resourceList: ResourceList,
  ref: ResourceReference
): Promise<Role> {
  if (ref.type == ReferenceType.ID) {
    const role = await server.roles.fetch(ref.id);
    if (!role) throw new ActionSyntaxError(`Null role reference ${ref.id}`);
    return role;
  }
  if (ref.type == ReferenceType.Pointer) {
    const role = resourceList[ref.index];
    if (!(role instanceof Role) || !role) {
      throw new ActionSyntaxError(`Null pointer ${ref.index}`);
    }
    return role;
  }
  throw new ActionSyntaxError(`Unknown role reference type ${ref.type}`);
}

export async function resolveUserOrRoleReference(
  server: Guild,
  resourceList: ResourceList,
  ref: ResourceReference
): Promise<GuildMember | Role> {
  if (ref.type == ReferenceType.ID) {
    try {
      const role = await server.roles.fetch(ref.id);
      return role;
    } catch (e) {
      try {
        const user = await server.members.fetch(ref.id);
        return user;
      } catch (e) {
        throw new ActionSyntaxError(`Null role/user reference ${ref.id}`);
      }
    }
  }
  if (ref.type == ReferenceType.Pointer) {
    const role = resourceList[ref.index];
    if (!(role instanceof Role) || !role) {
      throw new ActionSyntaxError(`Null role pointer ${ref.index}`);
    }
    return role;
  }
}
export async function executeActions(
  server: Guild,
  actions: tAction[]
): Promise<void> {
  const resourceList: ResourceList = [];
  // For loop so it's easier to use await
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const executor = executors[action.action];
    if (!executor) continue;
    const createdResource = await executor(server, action, resourceList, i);
    if (createdResource) resourceList[i] = createdResource;
  }
}
