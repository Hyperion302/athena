import {
  Guild,
  Channel,
  Role,
  GuildMember,
  GuildChannel,
  Permissions,
  CategoryChannel,
} from 'discord.js';
import {
  tAction,
  ResourceReference,
  ReferenceType,
  Action,
  ServerSetting,
  RoleSetting,
  MoveRelativePosition,
  ChannelSetting,
} from '.';
import { ActionSyntaxError, ExecutionError } from '../errors';

type ResourceList = (Channel | Role)[];

function permissionToFlag(permission: number): string {
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

async function resolveUserReference(
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

async function resolveChannelReference(
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

async function resolveRoleReference(
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

async function resolveUserOrRoleReference(
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
    if (action.action == Action.Kick) {
      const user = await resolveUserReference(server, action.user);
      await user.kick();
    }
    if (action.action == Action.Ban) {
      const user = await resolveUserReference(server, action.user);
      await user.ban();
    }
    if (action.action == Action.CreateRole) {
      const createdRole = await server.roles.create({
        data: { name: action.name },
      });
      resourceList[i] = createdRole;
    }
    if (action.action == Action.CreateChannel) {
      const channel = await server.channels.create(action.name, {
        type: action.type,
      });
      resourceList[i] = channel;
    }
    if (action.action == Action.ChangeServerSetting) {
      switch (action.setting) {
        case ServerSetting.AFKChannel:
          const afkChannel = await resolveChannelReference(
            server,
            resourceList,
            action.value
          );
          if (afkChannel.type != 'voice') {
            throw new ExecutionError(i, 'AFK channel must be voice channel');
          }
          await server.setAFKChannel(afkChannel);
          break;
        case ServerSetting.AFKTimeout:
          await server.setAFKTimeout(action.value);
          break;
        case ServerSetting.ContentFilter:
          await server.setExplicitContentFilter(
            action.value ? 'ALL_MEMBERS' : 'DISABLED'
          );
          break;
        case ServerSetting.Name:
          await server.setName(action.value);
          break;
      }
    }
    if (action.action == Action.DestroyRole) {
      const role = await resolveRoleReference(
        server,
        resourceList,
        action.role
      );
      await role.delete();
      if (action.role.type == ReferenceType.Pointer) {
        delete resourceList[action.role.index];
      }
    }
    if (action.action == Action.ChangeRoleAssignment) {
      const role = await resolveRoleReference(
        server,
        resourceList,
        action.role
      );
      const grantPromises = action.grant.map(async (user) => {
        const resolvedUser = await resolveUserReference(server, user);
        await resolvedUser.roles.add(role);
      });
      const revokePromises = action.revoke.map(async (user) => {
        const resolvedUser = await resolveUserReference(server, user);
        await resolvedUser.roles.remove(role);
      });
      await Promise.all([...grantPromises, ...revokePromises]);
    }
    if (action.action == Action.ChangeRolePermissions) {
      const role = await resolveRoleReference(
        server,
        resourceList,
        action.role
      );
      let permissionBits = role.permissions;
      action.allow.forEach(
        (permission) => (permissionBits = permissionBits.add(permission))
      );
      action.deny.forEach(
        (permission) => (permissionBits = permissionBits.remove(permission))
      );
      await role.setPermissions(permissionBits);
    }
    if (action.action == Action.ChangeRoleSetting) {
      const role = await resolveRoleReference(
        server,
        resourceList,
        action.role
      );
      switch (action.setting) {
        case RoleSetting.Color:
          await role.setColor(action.value);
          break;
        case RoleSetting.Hoist:
          await role.setHoist(action.value);
          break;
        case RoleSetting.Mentionable:
          await role.setMentionable(action.value);
          break;
        case RoleSetting.Name:
          await role.setName(action.value);
          break;
      }
    }
    if (action.action == Action.MoveRole) {
      const role = await resolveRoleReference(
        server,
        resourceList,
        action.role
      );
      const relativeTo = await resolveRoleReference(
        server,
        resourceList,
        action.subject
      );
      const subjectPos = relativeTo.position;
      let newPos = 0;
      switch (action.direction) {
        case MoveRelativePosition.Above:
          newPos = subjectPos; // Setting the same position will force the stack downwards
          break;
        case MoveRelativePosition.Below:
          newPos = subjectPos - 1;
          newPos = Math.max(newPos, 0); // Clamp at 0
          break;
      }
      await role.setPosition(newPos);
    }
    if (
      action.action == Action.AddPermissionOverrideOn ||
      action.action == Action.ChangePermissionOverrideOn
    ) {
      const channel = await resolveChannelReference(
        server,
        resourceList,
        action.channel
      );
      const subject = await resolveUserOrRoleReference(
        server,
        resourceList,
        action.subject
      );
      const overwrites: { [key: string]: boolean } = {};
      action.allow.forEach((permission) => {
        overwrites[permissionToFlag(permission)] = true;
      });
      action.unset.forEach((permission) => {
        overwrites[permissionToFlag(permission)] = null;
      });
      action.deny.forEach((permission) => {
        overwrites[permissionToFlag(permission)] = false;
      });
      await channel.createOverwrite(subject, overwrites);
    }
    if (action.action == Action.RemovePermissionOverrideOn) {
      const channel = await resolveChannelReference(
        server,
        resourceList,
        action.channel
      );
      const removeSubject = await resolveUserOrRoleReference(
        server,
        resourceList,
        action.subject
      );
      const overwrites = channel.permissionOverwrites;
      overwrites.delete(removeSubject.id);
      await channel.overwritePermissions(overwrites);
    }
    if (action.action == Action.ChangeChannelSetting) {
      const channel = await resolveChannelReference(
        server,
        resourceList,
        action.channel
      );
      switch (action.setting) {
        case ChannelSetting.Name:
          await channel.setName(action.value);
          break;
        case ChannelSetting.Topic:
          if (channel.type != 'text') break;
          await channel.setTopic(action.value);
      }
    }
    if (action.action == Action.MoveChannel) {
      const channel = await resolveChannelReference(
        server,
        resourceList,
        action.channel
      );
      const relativeTo = await resolveChannelReference(
        server,
        resourceList,
        action.subject
      );
      const subjectPos = relativeTo.position;
      let newPos = 0;
      switch (action.direction) {
        case MoveRelativePosition.Above:
          newPos = subjectPos - 1;
          newPos = Math.max(newPos, 0);
          break;
        case MoveRelativePosition.Below:
          if (channel.type == 'category') {
            newPos = subjectPos + 1;
          } else {
            newPos = subjectPos;
          }
          break;
      }
      await channel.setPosition(newPos);
    }
    if (action.action == Action.DestroyChannel) {
      const channel = await resolveChannelReference(
        server,
        resourceList,
        action.channel
      );
      await channel.delete();
    }
    if (action.action == Action.SetCategory) {
      const channel = await resolveChannelReference(
        server,
        resourceList,
        action.channel
      );
      if (action.category == null) {
        await channel.setParent(null);
      } else {
        const category = await resolveChannelReference(
          server,
          resourceList,
          action.category
        );
        if (category.type != 'category') {
          throw new ExecutionError(i, `Target category isn't category`);
        }
        await channel.setParent(category as CategoryChannel); // Must be casted since I check the type above
      }
    }
    if (action.action == Action.SyncToCategory) {
      const channel = await resolveChannelReference(
        server,
        resourceList,
        action.channel
      );
      await channel.lockPermissions();
    }
  }
}
