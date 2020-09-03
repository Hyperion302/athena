import {
  RoleSetting,
  ServerSetting,
  ReferenceType,
  Action,
  ChannelSetting,
  ResourceReference,
  tAction,
  ActionLexer,
  MoveRelativePosition,
  ChannelType,
  MAX_SERVER_LENGTH,
  MIN_CHANNEL_LENGTH,
  MAX_CHANNEL_LENGTH,
  MIN_SERVER_LENGTH,
  MIN_TOPIC_LENGTH,
  MAX_TOPIC_LENGTH,
  MIN_COLOR,
  MAX_COLOR,
  MIN_ROLE_LENGTH,
  MAX_ROLE_LENGTH,
  MAX_ACTION_LENGTH,
} from '.';
import { IToken } from 'chevrotain';
import { Permissions } from 'discord.js';
import { ActionSyntaxError } from '../errors';

export function parseDuration(duration: string): number {
  const unit = duration.slice(-1);
  const magnitude = parseInt(duration.slice(0, -1), 10);
  let multiplier: number;
  switch (unit) {
    case 's':
      multiplier = 1;
      break;
    case 'm':
      multiplier = 60;
      break;
    case 'h':
      multiplier = 60 * 60;
      break;
    case 'd':
      multiplier = 60 * 60 * 24;
      break;
    default:
      return null;
  }
  return magnitude * multiplier;
}

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
      throw new ActionSyntaxError(`Unrecognized permission ${token.image}`);
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
  throw new ActionSyntaxError(`Unrecognized role setting ${token.image}`);
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
  throw new ActionSyntaxError(`Unrecognized server setting ${token.image}`);
}

function parseChannelSetting(token: IToken): ChannelSetting {
  const name = token.tokenType.name;
  if (name == 'Name') {
    return ChannelSetting.Name;
  }
  if (name == 'Topic') {
    return ChannelSetting.Topic;
  }
  throw new ActionSyntaxError(`Unrecognized channel setting ${token.image}`);
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
      throw new ActionSyntaxError(`Invalid username ${token.image}`);
    }
    return {
      type: ReferenceType.Username,
      username,
      discriminator: discrim,
    };
  } else {
    throw new ActionSyntaxError(`Invalid user reference ${token.image}`);
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
      type: ReferenceType.Pointer,
      index: parseInt(token.image.slice(1), 10) - 1,
    };
  } else if (token.tokenType.name == 'ExactName') {
    return {
      type: ReferenceType.FullName,
      name: token.image.slice(1, -1),
    };
  } else {
    throw new ActionSyntaxError(`Invalid channel reference ${token.image}`);
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
      type: ReferenceType.Pointer,
      index: parseInt(token.image.slice(1), 10) - 1,
    };
  } else if (token.tokenType.name == 'ExactName') {
    return {
      type: ReferenceType.FullName,
      name: token.image.slice(1, -1),
    };
  } else {
    throw new ActionSyntaxError(`Invalid role reference ${token.image}`);
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
      type: ReferenceType.Pointer,
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
      throw new ActionSyntaxError('Invalid username');
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
  if (actionString.length > MAX_ACTION_LENGTH) {
    throw new ActionSyntaxError(
      `Action cannot be longer than ${MAX_ACTION_LENGTH} characters`
    );
  }
  const lexed = ActionLexer.tokenize(actionString);
  if (lexed.errors.length) {
    throw new ActionSyntaxError('Syntax error in action string');
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
      throw new ActionSyntaxError('Must provide assignments');
    }
    if (assignmentTokens.length % 2 != 0) {
      // Odd # means something's wrong
      throw new ActionSyntaxError('Malformed assignment list');
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
      throw new ActionSyntaxError('Must provide roles');
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
      throw new ActionSyntaxError('Must provide roles');
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
      throw new ActionSyntaxError('Must provide permissions');
    }
    if (permissionTokens.length % 2 != 0) {
      throw new ActionSyntaxError('Malformed permission list');
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
      throw new ActionSyntaxError('Must provide permissions');
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
      throw new ActionSyntaxError('Must provide permissions');
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
      throw new ActionSyntaxError(`Unexpected token ${tokens[2].image}`);
    }
    const subjectRef = parseSubjectToken(tokens[3]);
    const permissionTokens = tokens.slice(4);
    const allow: number[] = [];
    const unset: number[] = [];
    const deny: number[] = [];
    if (!permissionTokens || !permissionTokens.length) {
      throw new ActionSyntaxError('Must provide permissions');
    }
    if (permissionTokens.length % 2 != 0) {
      throw new ActionSyntaxError('Malformed permission list');
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
      throw new ActionSyntaxError(`Unexpected token ${tokens[2].image}`);
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
        const colorString = tokens.slice(3)[0].image;
        const colorNum = parseInt(colorString, 10);
        if (!colorNum) {
          throw new ActionSyntaxError(`Invalid color ${colorString}`);
        }
        if (colorNum < MIN_COLOR || colorNum > MAX_COLOR) {
          throw new ActionSyntaxError('Color out of bounds');
        }
        return {
          action: Action.ChangeRoleSetting,
          role: roleRef,
          setting,
          value: colorNum,
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
        const name = tokens.slice(3).join(' ');
        if (name.length < MIN_ROLE_LENGTH || name.length > MAX_ROLE_LENGTH) {
          throw new ActionSyntaxError(
            `Role name too long or too short (${MIN_ROLE_LENGTH}-${MAX_ROLE_LENGTH})`
          );
        }
        return {
          action: Action.ChangeRoleSetting,
          role: roleRef,
          setting,
          value: name,
        };
      default:
        throw new ActionSyntaxError(`Unrecognized role setting ${setting}`);
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
      throw new ActionSyntaxError(`Unrecognized direction ${tokens[2].image}`);
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
      throw new ActionSyntaxError(`Unrecognized direction ${tokens[2].image}`);
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
    } else if (tokens[1].image == ChannelType.Category) {
      type = ChannelType.Category;
    } else {
      throw new ActionSyntaxError(
        `Unrecognized channel type ${tokens[1].image}`
      );
    }
    if (name.length < MIN_CHANNEL_LENGTH || name.length > MAX_CHANNEL_LENGTH) {
      throw new ActionSyntaxError(
        `Channel name too long or too short (${MIN_CHANNEL_LENGTH}-${MAX_CHANNEL_LENGTH})`
      );
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
      return {
        action: Action.ChangeServerSetting,
        setting: ServerSetting.AFKChannel,
        value: parseChannelToken(tokens[2]),
      };
    } else if (setting == ServerSetting.AFKTimeout) {
      const duration = parseDuration(tokens[2].image);
      if (!duration) {
        throw new ActionSyntaxError(`Invalid duration ${duration}`);
      }
      return {
        action: Action.ChangeServerSetting,
        setting: ServerSetting.AFKTimeout,
        value: duration,
      };
    } else if (setting == ServerSetting.Name) {
      value = tokens
        .slice(2)
        .map((token) => token.image)
        .join(' ');
      if (
        value.length < MIN_SERVER_LENGTH ||
        value.length > MAX_SERVER_LENGTH
      ) {
        throw new ActionSyntaxError(
          `Server name too long or too short (${MIN_SERVER_LENGTH}-${MAX_SERVER_LENGTH})`
        );
      }
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
      throw new ActionSyntaxError(`Unrecognized server setting ${setting}`);
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
    if (setting == ChannelSetting.Name) {
      if (
        value.length < MIN_CHANNEL_LENGTH ||
        value.length > MAX_CHANNEL_LENGTH
      ) {
        throw new ActionSyntaxError(
          `Channel name too long or too short (${MIN_CHANNEL_LENGTH}-${MAX_CHANNEL_LENGTH})`
        );
      }
    } else if (setting == ChannelSetting.Topic) {
      if (value.length < MIN_TOPIC_LENGTH || value.length > MAX_TOPIC_LENGTH) {
        throw new ActionSyntaxError(
          `Topic too long or too short (${MIN_TOPIC_LENGTH}-${MAX_TOPIC_LENGTH})`
        );
      }
    } else {
      throw new ActionSyntaxError(`Unrecognized channel setting ${setting}`);
    }
    return {
      action: Action.ChangeChannelSetting,
      channel: channelRef,
      setting,
      value,
    };
  }

  if (actionName == Action.SetCategory) {
    const channelRef = parseChannelToken(tokens[1]);
    const parentToken = tokens[2];
    if (parentToken.image == 'none') {
      // Unset parent
      return {
        action: Action.SetCategory,
        channel: channelRef,
        category: null,
      };
    }
    const parentRef = parseChannelToken(parentToken);
    return {
      action: Action.SetCategory,
      channel: channelRef,
      category: parentRef,
    };
  }

  if (actionName == Action.SyncToCategory) {
    const channelRef = parseChannelToken(tokens[1]);
    return {
      action: Action.SyncToCategory,
      channel: channelRef,
    };
  }

  throw new ActionSyntaxError(`Unrecognized action ${actionToken.image}`);
}
