import { Permissions, Channel } from 'discord.js';
import { ActionLexer } from './actionLexer';
import { IToken } from 'chevrotain';
import { parseDuration } from './commands';
import { Server } from 'http';

// Since the shorthand actions are, well, shorthands
// there are no action data types for them since I can
// reuse the non-shorthand data structure

export const enum Action {
  Kick = 'kick',
  Ban = 'ban',
  CreateRole = 'create role',
  DestroyRole = 'destroy role',
  ChangeRoleAssignment = 'change role assignment',
  GrantRole = 'grant role',
  RevokeRole = 'revoke role',
  ChangeRolePermissions = 'change role permissions',
  AllowPermissions = 'allow permissions',
  DenyPermissions = 'deny permissions',
  AddPermissionOverrideOn = 'add permission override on',
  ChangePermissionOverrideOn = 'change permission override on',
  RemovePermissionOverrideOn = 'remove permission override on',
  ChangeRoleSetting = 'change role setting',
  MoveRole = 'move role',
  MoveChannel = 'move channel',
  CreateChannel = 'create channel',
  DestroyChannel = 'destroy channel',
  ChangeServerSetting = 'change server setting',
  ChangeChannelSetting = 'change channel setting',
}

export enum RoleSetting {
  Color = 'color',
  Hoist = 'hoist',
  Mentionable = 'mentionable',
  Name = 'name',
}

export enum ServerSetting {
  AFKChannel = 'afk channel',
  AFKTimeout = 'afk timeout',
  Name = 'name',
  ContentFilter = 'content filter',
  // TODO: More
}

export enum ChannelSetting {
  Name = 'name',
  Topic = 'topic',
}

export enum MoveRelativePosition {
  Above = 'above',
  Below = 'below',
}

export enum ChannelType {
  Text = 'text',
  Voice = 'voice',
}

interface KickAction {
  action: Action.Kick;
  user: ResourceReference;
}

interface BanAction {
  action: Action.Ban;
  user: ResourceReference;
}

interface CreateRoleAction {
  action: Action.CreateRole;
  name: string;
}

interface DestroyRoleAction {
  action: Action.DestroyRole;
  role: ResourceReference;
}

interface ChangeRoleAssignmentAction {
  action: Action.ChangeRoleAssignment;
  role: ResourceReference;
  grant: ResourceReference[];
  revoke: ResourceReference[];
}

interface ChangeRolePermissionsAction {
  action: Action.ChangeRolePermissions;
  role: ResourceReference;
  allow: number[];
  deny: number[];
}

interface AddPermissionOverrideAction {
  action: Action.AddPermissionOverrideOn;
  channel: ResourceReference;
  subject: ResourceReference; // Role or user
  allow: number[];
  unset: number[];
  deny: number[];
}

interface ChangePermissionOverrideAction {
  action: Action.ChangePermissionOverrideOn;
  channel: ResourceReference;
  subject: ResourceReference; // Role or user
  allow: number[];
  unset: number[];
  deny: number[];
}

interface RemovePermissionOverrideAction {
  action: Action.RemovePermissionOverrideOn;
  channel: ResourceReference;
  subject: ResourceReference; // Role or user
}

type ChangeRoleSettingAction =
  | ChangeRoleNameAction
  | ChangeRoleColorAction
  | ChangeRoleMentionableAction
  | ChangeRoleHoistAction;

interface ChangeRoleNameAction {
  action: Action.ChangeRoleSetting;
  role: ResourceReference;
  setting: RoleSetting.Name;
  value: string;
}

interface ChangeRoleColorAction {
  action: Action.ChangeRoleSetting;
  role: ResourceReference;
  setting: RoleSetting.Color;
  value: number;
}

interface ChangeRoleMentionableAction {
  action: Action.ChangeRoleSetting;
  role: ResourceReference;
  setting: RoleSetting.Mentionable;
  value: boolean;
}

interface ChangeRoleHoistAction {
  action: Action.ChangeRoleSetting;
  role: ResourceReference;
  setting: RoleSetting.Hoist;
  value: boolean;
}

interface MoveRoleAction {
  action: Action.MoveRole;
  role: ResourceReference;
  direction: MoveRelativePosition;
  subject: ResourceReference;
}

interface MoveChannelAction {
  action: Action.MoveChannel;
  channel: ResourceReference;
  direction: MoveRelativePosition;
  subject: ResourceReference;
}

interface CreateChannelAction {
  action: Action.CreateChannel;
  name: string;
  type: ChannelType;
}

interface DestroyChannelAction {
  action: Action.DestroyChannel;
  channel: ResourceReference;
}

type ChangeServerSettingAction =
  | ChangeServerAFKChannelAction
  | ChangeServerAFKTimeoutAction
  | ChangeServerNameAction
  | ChangeServerContentFilterAction;

interface ChangeServerAFKChannelAction {
  action: Action.ChangeServerSetting;
  setting: ServerSetting.AFKChannel;
  value: ResourceReference;
}

interface ChangeServerAFKTimeoutAction {
  action: Action.ChangeServerSetting;
  setting: ServerSetting.AFKTimeout;
  value: number;
}

interface ChangeServerNameAction {
  action: Action.ChangeServerSetting;
  setting: ServerSetting.Name;
  value: string;
}

interface ChangeServerContentFilterAction {
  action: Action.ChangeServerSetting;
  setting: ServerSetting.ContentFilter;
  value: boolean;
}

interface ChangeChannelSettingAction {
  action: Action.ChangeChannelSetting;
  channel: ResourceReference;
  setting: ChannelSetting;
  value: string;
}

// Convenience union type
export type tAction =
  | KickAction
  | BanAction
  | CreateRoleAction
  | DestroyRoleAction
  | ChangeRoleAssignmentAction
  | ChangeRolePermissionsAction
  | ChangePermissionOverrideAction
  | AddPermissionOverrideAction
  | RemovePermissionOverrideAction
  | ChangeRoleSettingAction
  | MoveRoleAction
  | MoveChannelAction
  | CreateChannelAction
  | DestroyChannelAction
  | ChangeServerSettingAction
  | ChangeChannelSettingAction;

export enum ReferenceType {
  Output,
  ID,
  FullName,
  Username,
}

interface UsernameResourceReference {
  type: ReferenceType.Username;
  username: string;
  discriminator: number;
}

interface IDResourceReference {
  type: ReferenceType.ID;
  id: string;
}

interface OutputResourceReference {
  type: ReferenceType.Output;
  index: number;
}

interface FullNameResourceReference {
  type: ReferenceType.FullName;
  name: string;
}

export type ResourceReference =
  | IDResourceReference
  | OutputResourceReference
  | FullNameResourceReference
  | UsernameResourceReference;

function parsePermissionToken(token: IToken): number {
  switch (token.tokenType.name) {
    case 'Administrator':
      return Permissions.FLAGS.ADMINISTRATOR;
    case 'CreateInvite':
      return Permissions.FLAGS.CREATE_INSTANT_INVITE;
    case 'ManageChannels':
      return Permissions.FLAGS.MANAGE_CHANNELS;
    case 'ManageServer':
      return Permissions.FLAGS.MANAGE_GUILD;
    case 'AddReactions':
      return Permissions.FLAGS.ADD_REACTIONS;
    case 'ViewAuditLog':
      return Permissions.FLAGS.VIEW_AUDIT_LOG;
    case 'PrioritySpeaker':
      return Permissions.FLAGS.PRIORITY_SPEAKER;
    case 'Stream':
      return Permissions.FLAGS.STREAM;
    case 'ViewChannel':
      return Permissions.FLAGS.VIEW_CHANNEL;
    case 'SendMessages':
      return Permissions.FLAGS.SEND_MESSAGES;
    case 'SendTTSMessages':
      return Permissions.FLAGS.SEND_TTS_MESSAGES;
    case 'ManageMessages':
      return Permissions.FLAGS.MANAGE_MESSAGES;
    case 'EmbedLinks':
      return Permissions.FLAGS.EMBED_LINKS;
    case 'AttachFiles':
      return Permissions.FLAGS.ATTACH_FILES;
    case 'ReadMessageHistory':
      return Permissions.FLAGS.READ_MESSAGE_HISTORY;
    case 'MentionEveryone':
      return Permissions.FLAGS.MENTION_EVERYONE;
    case 'ExternalEmojis':
      return Permissions.FLAGS.USE_EXTERNAL_EMOJIS;
    case 'ViewGuildInsights':
      return Permissions.FLAGS.VIEW_GUILD_INSIGHTS;
    case 'Connect':
      return Permissions.FLAGS.CONNECT;
    case 'Speak':
      return Permissions.FLAGS.SPEAK;
    case 'MuteMembers':
      return Permissions.FLAGS.MUTE_MEMBERS;
    case 'DeafenMembers':
      return Permissions.FLAGS.DEAFEN_MEMBERS;
    case 'MoveMembers':
      return Permissions.FLAGS.MOVE_MEMBERS;
    case 'UseVAD':
      return Permissions.FLAGS.USE_VAD;
    case 'ChangeNickname':
      return Permissions.FLAGS.CHANGE_NICKNAME;
    case 'ManageNicknames':
      return Permissions.FLAGS.MANAGE_NICKNAMES;
    case 'ManageRoles':
      return Permissions.FLAGS.MANAGE_ROLES;
    case 'ManageWebhooks':
      return Permissions.FLAGS.MANAGE_WEBHOOKS;
    case 'ManageEmojis':
      return Permissions.FLAGS.MANAGE_EMOJIS;
    default:
      throw new Error(`Unknown permission ${token.image}`);
  }
}

function parseRoleSettingToken(token: IToken): RoleSetting {
  const name = token.tokenType.name;
  if (name == 'Color') {
    return RoleSetting.Color;
  }
  if (name == 'Hoist') {
    return RoleSetting.Hoist;
  }
  if (name == 'Mentionable') {
    return RoleSetting.Mentionable;
  }
  if (name == 'Name') {
    return RoleSetting.Name;
  }
  throw new Error(`Unrecognized role setting ${name}`);
}

function parseServerSettingToken(
  token: IToken
):
  | ServerSetting.AFKChannel
  | ServerSetting.AFKTimeout
  | ServerSetting.Name
  | ServerSetting.ContentFilter {
  const name = token.tokenType.name;
  if (name == 'AFKChannel') {
    return ServerSetting.AFKChannel;
  }
  if (name == 'AFKTimeout') {
    return ServerSetting.AFKTimeout;
  }
  if (name == 'Name') {
    return ServerSetting.Name;
  }
  if (name == 'ContentFilter') {
    return ServerSetting.ContentFilter;
  }
  throw new Error(`Unrecognized server setting ${name}`);
}

function parseChannelSetting(token: IToken): ChannelSetting {
  const name = token.tokenType.name;
  if (name == 'Name') {
    return ChannelSetting.Name;
  }
  if (name == 'Topic') {
    return ChannelSetting.Topic;
  }
  throw new Error('Unrecognized channel setting');
}

function parseUserToken(token: IToken): ResourceReference {
  if (token.tokenType.name == 'ID') {
    return {
      type: ReferenceType.ID,
      id: token.image.slice(1),
    };
  } else if (token.tokenType.name == 'UserMention') {
    return {
      type: ReferenceType.ID,
      id: token.image.match('\\d+')[0],
    };
  } else if (token.tokenType.name == 'ExactUsername') {
    const match = token.image.slice(1, -1).match('(.+)#(\\d+)');
    const username = match[1];
    const discrim = parseInt(match[2], 10);
    if (!(username && discrim)) {
      throw new Error('Invalid username');
    }
    return {
      type: ReferenceType.Username,
      username,
      discriminator: discrim,
    };
  } else {
    throw new Error('Invalid user reference');
  }
}

function parseChannelToken(token: IToken): ResourceReference {
  if (token.tokenType.name == 'ID') {
    return {
      type: ReferenceType.ID,
      id: token.image.slice(1),
    };
  } else if (token.tokenType.name == 'ChannelMention') {
    return {
      type: ReferenceType.ID,
      id: token.image.match('\\d+')[0],
    };
  } else if (token.tokenType.name == 'OutputReference') {
    return {
      type: ReferenceType.Output,
      index: parseInt(token.image.slice(1), 10) - 1,
    };
  } else if (token.tokenType.name == 'ExactName') {
    return {
      type: ReferenceType.FullName,
      name: token.image.slice(1, -1),
    };
  } else {
    throw new Error('Invalid channel reference');
  }
}

function parseRoleToken(token: IToken): ResourceReference {
  if (token.tokenType.name == 'ID') {
    return {
      type: ReferenceType.ID,
      id: token.image.slice(1),
    };
  } else if (token.tokenType.name == 'RoleMention') {
    return {
      type: ReferenceType.ID,
      id: token.image.match('\\d+')[0],
    };
  } else if (token.tokenType.name == 'OutputReference') {
    return {
      type: ReferenceType.Output,
      index: parseInt(token.image.slice(1), 10) - 1,
    };
  } else if (token.tokenType.name == 'ExactName') {
    return {
      type: ReferenceType.FullName,
      name: token.image.slice(1, -1),
    };
  } else {
    throw new Error('Invalid role reference');
  }
}

function parseSubjectToken(token: IToken): ResourceReference {
  if (token.tokenType.name == 'ID') {
    return {
      type: ReferenceType.ID,
      id: token.image.slice(1),
    };
  } else if (token.tokenType.name == 'RoleMention') {
    return {
      type: ReferenceType.ID,
      id: token.image.match('\\d+')[0],
    };
  } else if (token.tokenType.name == 'UserMention') {
    return {
      type: ReferenceType.ID,
      id: token.image.match('\\d+')[0],
    };
  } else if (token.tokenType.name == 'OutputReference') {
    return {
      type: ReferenceType.Output,
      index: parseInt(token.image.slice(1), 10) - 1,
    };
  } else if (token.tokenType.name == 'ExactName') {
    return {
      type: ReferenceType.FullName,
      name: token.image.slice(1, -1),
    };
  } else if (token.tokenType.name == 'ExactUsername') {
    const match = token.image.slice(1, -1).match('(.+)#(\\d+)');
    const username = match[1];
    const discrim = parseInt(match[2], 10);
    if (!(username && discrim)) {
      throw new Error('Invalid username');
    }
    return {
      type: ReferenceType.Username,
      username,
      discriminator: discrim,
    };
  }
}

export function parseAction(actionString: string): tAction {
  // Lex the action string
  const lexed = ActionLexer.tokenize(actionString);
  if (lexed.errors.length) {
    console.warn(lexed.errors);
    throw new Error('Syntax error in action string');
  }
  const tokens = lexed.tokens;
  const actionToken = tokens[0];
  const actionName = actionToken.image;

  if (actionName == Action.Kick) {
    const userRef = parseUserToken(tokens[1]);
    return {
      action: Action.Kick,
      user: userRef,
    };
  }

  if (actionName == Action.Ban) {
    const userRef = parseUserToken(tokens[1]);
    return {
      action: Action.Ban,
      user: userRef,
    };
  }

  if (actionName == Action.CreateRole) {
    const roleName = tokens
      .map((token) => token.image)
      .slice(1)
      .join(' ');
    return {
      action: Action.CreateRole,
      name: roleName,
    };
  }

  if (actionName == Action.DestroyRole) {
    const roleRef = parseRoleToken(tokens[1]);
    return {
      action: Action.DestroyRole,
      role: roleRef,
    };
  }

  if (actionName == Action.ChangeRoleAssignment) {
    const roleRef = parseRoleToken(tokens[1]);
    const assignmentTokens = tokens.slice(2);
    const grants: ResourceReference[] = [],
      revocations: ResourceReference[] = [];
    if (!assignmentTokens || !assignmentTokens.length) {
      throw new Error('Invalid user list');
    }
    if (assignmentTokens.length % 2 != 0) {
      // Odd # means something's wrong
      throw new Error('invalid user list');
    }
    for (let i = 0; i < assignmentTokens.length; i += 2) {
      const userRef = parseUserToken(assignmentTokens[i + 1]);
      if (assignmentTokens[i].tokenType.name == 'Cross') {
        grants.push(userRef);
      }
      if (assignmentTokens[i].tokenType.name == 'Dash') {
        revocations.push(userRef);
      }
    }
    return {
      action: Action.ChangeRoleAssignment,
      role: roleRef,
      grant: grants,
      revoke: revocations,
    };
  }

  if (actionName == Action.GrantRole) {
    const roleRef = parseRoleToken(tokens[1]);
    const grantTokens = tokens.slice(2);
    if (!grantTokens || !grantTokens.length) {
      throw new Error('Invalid user list');
    }
    const grants = grantTokens.map(parseUserToken);
    return {
      action: Action.ChangeRoleAssignment,
      role: roleRef,
      grant: grants,
      revoke: [],
    };
  }

  if (actionName == Action.RevokeRole) {
    const roleRef = parseRoleToken(tokens[1]);
    const revokeTokens = tokens.slice(2);
    if (!revokeTokens || !revokeTokens.length) {
      throw new Error('Invalid user list');
    }
    const revocations = revokeTokens.map(parseUserToken);
    return {
      action: Action.ChangeRoleAssignment,
      role: roleRef,
      grant: [],
      revoke: revocations,
    };
  }

  if (actionName == Action.ChangeRolePermissions) {
    const roleRef = parseRoleToken(tokens[1]);
    const permissionTokens = tokens.slice(2);
    const allow: number[] = [],
      deny: number[] = [];
    if (!permissionTokens || !permissionTokens.length) {
      throw new Error('Invalid permission list');
    }
    if (permissionTokens.length % 2 != 0) {
      throw new Error('Invalid permission list');
    }
    for (let i = 0; i < permissionTokens.length; i += 2) {
      const permission = parsePermissionToken(permissionTokens[i + 1]);
      const modeTokenName = permissionTokens[i].tokenType.name;
      if (modeTokenName == 'Cross') {
        allow.push(permission);
      }
      if (modeTokenName == 'Dash') {
        deny.push(permission);
      }
    }
    return {
      action: Action.ChangeRolePermissions,
      role: roleRef,
      allow,
      deny,
    };
  }

  if (actionName == Action.AllowPermissions) {
    const roleRef = parseRoleToken(tokens[1]);
    const permissionTokens = tokens.slice(2);
    if (!permissionTokens || !permissionTokens.length) {
      throw new Error('Invalid permission list');
    }
    const permissions = permissionTokens.map(parsePermissionToken);
    return {
      action: Action.ChangeRolePermissions,
      role: roleRef,
      allow: permissions,
      deny: [],
    };
  }

  if (actionName == Action.DenyPermissions) {
    const roleRef = parseRoleToken(tokens[1]);
    const permissionTokens = tokens.slice(2);
    if (!permissionTokens || !permissionTokens.length) {
      throw new Error('Invalid permission list');
    }
    const permissions = permissionTokens.map(parsePermissionToken);
    return {
      action: Action.ChangeRolePermissions,
      role: roleRef,
      allow: [],
      deny: permissions,
    };
  }

  // Both actions are identical
  if (
    actionName == Action.AddPermissionOverrideOn ||
    actionName == Action.ChangePermissionOverrideOn
  ) {
    const channelRef = parseChannelToken(tokens[1]);
    if (tokens[2].tokenType.name != 'For') {
      throw new Error(`Invalid syntax at "${tokens[2].image}"`);
    }
    const subjectRef = parseSubjectToken(tokens[3]);
    const permissionTokens = tokens.slice(4);
    const allow: number[] = [];
    const unset: number[] = [];
    const deny: number[] = [];
    if (!permissionTokens || !permissionTokens.length) {
      throw new Error('Invalid permission list');
    }
    if (permissionTokens.length % 2 != 0) {
      throw new Error('Invalid permission list');
    }
    for (let i = 0; i < permissionTokens.length; i += 2) {
      const permission = parsePermissionToken(permissionTokens[i + 1]);
      const modeName = permissionTokens[i].tokenType.name;
      if (modeName == 'Cross') {
        allow.push(permission);
      }
      if (modeName == 'Approx') {
        unset.push(permission);
      }
      if (modeName == 'Dash') {
        deny.push(permission);
      }
    }
    return {
      action: actionName,
      subject: subjectRef,
      channel: channelRef,
      allow,
      deny,
      unset,
    };
  }

  if (actionName == Action.RemovePermissionOverrideOn) {
    const channelRef = parseChannelToken(tokens[1]);
    if (tokens[2].tokenType.name != 'For') {
      throw new Error(`Invalid syntax at "${tokens[2].image}"`);
    }
    const subjectRef = parseSubjectToken(tokens[3]);
    return {
      action: Action.RemovePermissionOverrideOn,
      channel: channelRef,
      subject: subjectRef,
    };
  }

  if (actionName == Action.ChangeRoleSetting) {
    const roleRef = parseRoleToken(tokens[1]);
    const setting = parseRoleSettingToken(tokens[2]);
    switch (setting) {
      case RoleSetting.Color:
        return {
          action: Action.ChangeRoleSetting,
          role: roleRef,
          setting,
          value: parseInt(tokens.slice(3)[0].image, 10),
        };
      case RoleSetting.Hoist:
      case RoleSetting.Mentionable:
        return {
          action: Action.ChangeRoleSetting,
          role: roleRef,
          setting,
          value: tokens.slice(3)[0].image == 'true',
        };
      case RoleSetting.Name:
        return {
          action: Action.ChangeRoleSetting,
          role: roleRef,
          setting,
          value: tokens.slice(3).join(' '),
        };
      default:
        throw new Error(`Unrecognized role setting ${setting}`);
    }
  }

  if (actionName == Action.MoveRole) {
    const roleRef = parseRoleToken(tokens[1]);
    const subjectRef = parseRoleToken(tokens[3]);
    let direction: MoveRelativePosition;
    if (tokens[2].image == MoveRelativePosition.Above) {
      direction = MoveRelativePosition.Above;
    } else if (tokens[2].image == MoveRelativePosition.Below) {
      direction = MoveRelativePosition.Below;
    } else {
      throw new Error('Unrecognized direction');
    }
    return {
      action: Action.MoveRole,
      role: roleRef,
      direction,
      subject: subjectRef,
    };
  }

  if (actionName == Action.MoveChannel) {
    const channelRef = parseChannelToken(tokens[1]);
    const subjectRef = parseChannelToken(tokens[3]);
    let direction: MoveRelativePosition;
    if (tokens[2].image == MoveRelativePosition.Above) {
      direction = MoveRelativePosition.Above;
    } else if (tokens[2].image == MoveRelativePosition.Below) {
      direction = MoveRelativePosition.Below;
    } else {
      throw new Error('Unrecognized direction');
    }
    return {
      action: Action.MoveChannel,
      channel: channelRef,
      direction,
      subject: subjectRef,
    };
  }

  if (actionName == Action.CreateChannel) {
    let name = tokens
      .slice(2)
      .map((token) => token.image)
      .join(' ');
    let type: ChannelType;
    if (tokens[1].image == ChannelType.Text) {
      type = ChannelType.Text;
      name = name.toLowerCase().replace(' ', '-');
    } else if (tokens[1].image == ChannelType.Voice) {
      type = ChannelType.Voice;
    } else {
      throw new Error('Unrecognized channel type');
    }
    return {
      action: Action.CreateChannel,
      name,
      type,
    };
  }

  if (actionName == Action.DestroyChannel) {
    const channelRef = parseChannelToken(tokens[1]);
    return {
      action: Action.DestroyChannel,
      channel: channelRef,
    };
  }

  if (actionName == Action.ChangeServerSetting) {
    const setting = parseServerSettingToken(tokens[1]);
    let value: ResourceReference | number | string | boolean;
    if (setting == ServerSetting.AFKChannel) {
      console.log(tokens[2]);
      console.log(parseChannelToken(tokens[2]));
      return {
        action: Action.ChangeServerSetting,
        setting: ServerSetting.AFKChannel,
        value: parseChannelToken(tokens[2]),
      };
    } else if (setting == ServerSetting.AFKTimeout) {
      return {
        action: Action.ChangeServerSetting,
        setting: ServerSetting.AFKTimeout,
        value: parseDuration(tokens[2].image),
      };
    } else if (setting == ServerSetting.Name) {
      value = tokens
        .slice(2)
        .map((token) => token.image)
        .join(' ');
      return {
        action: Action.ChangeServerSetting,
        setting: ServerSetting.Name,
        value,
      };
    } else if (setting == ServerSetting.ContentFilter) {
      return {
        action: Action.ChangeServerSetting,
        setting: ServerSetting.ContentFilter,
        value: tokens[2].image == 'true',
      };
    } else {
      throw new Error('Unrecognized server setting');
    }
  }

  if (actionName == Action.ChangeChannelSetting) {
    const channelRef = parseChannelToken(tokens[1]);
    const setting = parseChannelSetting(tokens[2]);
    // Both settings are strings
    const value = tokens
      .slice(3)
      .map((token) => token.image)
      .join(' ');
    return {
      action: Action.ChangeChannelSetting,
      channel: channelRef,
      setting,
      value,
    };
  }

  throw new Error(`Unrecognized action ${actionToken.image}`);
}
