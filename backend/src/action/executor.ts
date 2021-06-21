import {
  Guild,
  Channel,
  Role,
  GuildMember,
  GuildChannel,
  Permissions,
  CategoryChannel,
} from 'discord.js';
import { create } from 'domain';
import {
  ResourceReference,
  ReferenceType,
  Action,
  ServerSetting,
  RoleSetting,
  MoveRelativePosition,
  ChannelSetting,
} from '.';
import { ActionSyntaxError, ExecutionError } from '../errors';
import { executors, tAction } from './actions';

export type ResourceList = (Channel | Role)[];

export function permissionToFlag(permission: number): string {
  const pflags = Permissions.FLAGS;
  switch (permission) {
    case pflags.ADMINISTRATOR:
      return 'ADMINISTRATOR';
    case pflags.CREATE_INSTANT_INVITE:
      return 'CREATE_INSTANT_INVITE';
    case pflags.MANAGE_CHANNELS:
      return 'MANAGE_CHANNELS';
    case pflags.MANAGE_GUILD:
      return 'MANAGE_GUILD';
    case pflags.ADD_REACTIONS:
      return 'ADD_REACTIONS';
    case pflags.VIEW_AUDIT_LOG:
      return 'VIEW_AUDIT_LOG';
    case pflags.PRIORITY_SPEAKER:
      return 'PRIORITY_SPEAKER';
    case pflags.STREAM:
      return 'STREAM';
    case pflags.VIEW_CHANNEL:
      return 'VIEW_CHANNEL';
    case pflags.SEND_MESSAGES:
      return 'SEND_MESSAGES';
    case pflags.SEND_TTS_MESSAGES:
      return 'SEND_TTS_MESSAGES';
    case pflags.MANAGE_MESSAGES:
      return 'MANAGE_MESSAGES';
    case pflags.EMBED_LINKS:
      return 'EMBED_LINKS';
    case pflags.ATTACH_FILES:
      return 'ATTACH_FILES';
    case pflags.READ_MESSAGE_HISTORY:
      return 'READ_MESSAGE_HISTORY';
    case pflags.MENTION_EVERYONE:
      return 'MENTION_EVERYONE';
    case pflags.USE_EXTERNAL_EMOJIS:
      return 'USE_EXTERNAL_EMOJIS';
    case pflags.VIEW_GUILD_INSIGHTS:
      return 'VIEW_GUILD_INSIGHTS';
    case pflags.CONNECT:
      return 'CONNECT';
    case pflags.SPEAK:
      return 'SPEAK';
    case pflags.MUTE_MEMBERS:
      return 'MUTE_MEMBERS';
    case pflags.DEAFEN_MEMBERS:
      return 'DEAFEN_MEMBERS';
    case pflags.MOVE_MEMBERS:
      return 'MOVE_MEMBERS';
    case pflags.USE_VAD:
      return 'USE_VAD';
    case pflags.CHANGE_NICKNAME:
      return 'CHANGE_NICKNAME';
    case pflags.MANAGE_NICKNAMES:
      return 'MANAGE_NICKNAMES';
    case pflags.MANAGE_ROLES:
      return 'MANAGE_ROLES';
    case pflags.MANAGE_WEBHOOKS:
      return 'MANAGE_WEBHOOKS';
    case pflags.MANAGE_EMOJIS:
      return 'MANAGE_EMOJI';
    default:
      return permission.toString();
  }
}

export async function resolveUserReference(
  server: Guild,
  ref: ResourceReference
): Promise<GuildMember> {
  if (ref.type == ReferenceType.Username) {
    await server.members.fetch();
    const user = server.members.cache.find(
      (member) =>
        member.user.username == ref.username &&
        member.user.discriminator == ref.discriminator.toString()
    );
    if (!user) {
      throw new ActionSyntaxError(
        `Null user reference ${ref.username}#${ref.discriminator}`
      );
    }
    return user;
  }
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
  if (ref.type == ReferenceType.FullName) {
    const channel = server.channels.cache.find(
      (channel) => channel.name == ref.name
    );
    if (!channel) {
      throw new ActionSyntaxError(`Null channel reference "${ref.name}"`);
    }
    return channel;
  }
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
  if (ref.type == ReferenceType.FullName) {
    await server.roles.fetch();
    const role = server.roles.cache.find((role) => role.name == ref.name);
    if (!role) throw new ActionSyntaxError(`Null role reference "${ref.name}"`);
    return role;
  }
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
  if (ref.type == ReferenceType.FullName) {
    await server.roles.fetch();
    const role = server.roles.cache.find((role) => role.name == ref.name);
    if (!role) throw new ActionSyntaxError(`Null role reference "${ref.name}"`);
    return role;
  }
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
  if (ref.type == ReferenceType.Username) {
    await server.members.fetch();
    const user = server.members.cache.find(
      (member) =>
        member.user.username == ref.username &&
        member.user.discriminator == ref.discriminator.toString()
    );
    if (!user) {
      throw new ActionSyntaxError(
        `Null user reference ${ref.username}#${ref.discriminator}`
      );
    }
    return user;
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
