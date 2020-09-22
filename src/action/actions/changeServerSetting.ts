import { createToken, IToken } from 'chevrotain';
import { Guild } from 'discord.js';
import { ActionSyntaxError, ExecutionError } from '../../errors';
import {
  Action,
  ServerSetting,
  ResourceReference,
  parseDuration,
  MIN_SERVER_LENGTH,
  MAX_SERVER_LENGTH,
} from '..';
import { resolveChannelReference, ResourceList } from '../executor';
import { PlainText } from '../lexer';
import { parseServerSettingToken, parseChannelToken } from '../parser';
import { ActionValidationResult, validateChannelReference } from '../validator';

export type ChangeServerSettingAction =
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
export const changeServerSettingToken = createToken({
  name: Action.ChangeServerSetting,
  pattern: new RegExp(Action.ChangeServerSetting),
  longer_alt: PlainText,
});
export function parseChangeServerSettingAction(
  tokens: IToken[]
): ChangeServerSettingAction {
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
    if (value.length < MIN_SERVER_LENGTH || value.length > MAX_SERVER_LENGTH) {
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
export async function validateChangeServerSettingAction(
  guild: Guild,
  action: ChangeServerSettingAction
): Promise<ActionValidationResult> {
  if (action.setting == ServerSetting.AFKChannel) {
    const channelValidation = validateChannelReference(guild, action.value);
    return {
      valid: channelValidation.valid,
      referenceValidations: [channelValidation],
    };
  }
  return { valid: true, referenceValidations: [] };
}
export async function executeChangeServerSettingAction(
  guild: Guild,
  action: ChangeServerSettingAction,
  resourceList: ResourceList,
  i: number
) {
  switch (action.setting) {
    case ServerSetting.AFKChannel:
      const afkChannel = await resolveChannelReference(
        guild,
        resourceList,
        action.value
      );
      if (afkChannel.type != 'voice') {
        throw new ExecutionError(i, 'AFK channel must be voice channel');
      }
      await guild.setAFKChannel(afkChannel);
      break;
    case ServerSetting.AFKTimeout:
      await guild.setAFKTimeout(action.value);
      break;
    case ServerSetting.ContentFilter:
      await guild.setExplicitContentFilter(
        action.value ? 'ALL_MEMBERS' : 'DISABLED'
      );
      break;
    case ServerSetting.Name:
      await guild.setName(action.value);
      break;
  }
}
