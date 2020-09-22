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
import { parseKickAction } from './actions/kick';
import { parsers } from './actions';

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

export function parsePermissionToken(token: IToken): number {
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
export function parseRoleSettingToken(token: IToken): RoleSetting {
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

export function parseServerSettingToken(
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

export function parseChannelSetting(token: IToken): ChannelSetting {
  const name = token.tokenType.name;
  if (name == 'Name') {
    return ChannelSetting.Name;
  }
  if (name == 'Topic') {
    return ChannelSetting.Topic;
  }
  throw new ActionSyntaxError(`Unrecognized channel setting ${token.image}`);
}

export function parseUserToken(token: IToken): ResourceReference {
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

export function parseChannelToken(token: IToken): ResourceReference {
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

export function parseRoleToken(token: IToken): ResourceReference {
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

export function parseSubjectToken(token: IToken): ResourceReference {
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

  const parser = parsers[actionName];

  if (!parser) {
    throw new ActionSyntaxError(`Unrecognized action ${actionToken.image}`);
  }

  const action = parser(tokens);

  return action;
}
