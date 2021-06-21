import { createToken, IToken } from 'chevrotain';
import { Guild } from 'discord.js';
import { ActionSyntaxError } from '../../errors';
import {
  Action,
  ResourceReference,
  ChannelSetting,
  MIN_CHANNEL_LENGTH,
  MAX_CHANNEL_LENGTH,
  MIN_TOPIC_LENGTH,
  MAX_TOPIC_LENGTH,
} from '..';
import { resolveChannelReference, ResourceList } from '../executor';
import { PlainText } from '../lexer';
import { parseChannelToken, parseChannelSetting } from '../parser';
import { ActionValidationResult, validateChannelReference } from '../validator';

export interface ChangeChannelSettingAction {
  action: Action.ChangeChannelSetting;
  channel: ResourceReference;
  setting: ChannelSetting;
  value: string;
}
export const changeChannelSettingToken = createToken({
  name: Action.ChangeChannelSetting,
  pattern: new RegExp(Action.ChangeChannelSetting),
  longer_alt: PlainText,
});
export function parseChangeChannelSettingAction(
  tokens: IToken[]
): ChangeChannelSettingAction {
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
export async function validateChangeChannelSettingAction(
  guild: Guild,
  action: ChangeChannelSettingAction
): Promise<ActionValidationResult> {
  const channelValidation = validateChannelReference(guild, action.channel);
  return {
    valid: channelValidation.valid,
    referenceValidations: [channelValidation],
  };
}
export async function executeChangeChannelSettingAction(
  guild: Guild,
  action: ChangeChannelSettingAction,
  resourceList: ResourceList
) {
  const channel = await resolveChannelReference(
    guild,
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
