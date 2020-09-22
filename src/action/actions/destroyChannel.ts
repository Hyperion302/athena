import { createToken, IToken } from 'chevrotain';
import { Guild } from 'discord.js';
import { Action, ResourceReference } from '..';
import { resolveChannelReference, ResourceList } from '../executor';
import { PlainText } from '../lexer';
import { parseChannelToken } from '../parser';
import { ActionValidationResult, validateChannelReference } from '../validator';

export interface DestroyChannelAction {
  action: Action.DestroyChannel;
  channel: ResourceReference;
}
export const destroyChannelToken = createToken({
  name: Action.DestroyChannel,
  pattern: new RegExp(Action.DestroyChannel),
  longer_alt: PlainText,
});
export function parseDestroyChannelAction(
  tokens: IToken[]
): DestroyChannelAction {
  const channelRef = parseChannelToken(tokens[1]);
  return {
    action: Action.DestroyChannel,
    channel: channelRef,
  };
}
export async function validateDestroyChannelAction(
  guild: Guild,
  action: DestroyChannelAction
): Promise<ActionValidationResult> {
  const channelValidation = validateChannelReference(guild, action.channel);
  return {
    valid: channelValidation.valid,
    referenceValidations: [channelValidation],
  };
}
export async function executeDestroyChannelAction(
  guild: Guild,
  action: DestroyChannelAction,
  resourceList: ResourceList
) {
  const channel = await resolveChannelReference(
    guild,
    resourceList,
    action.channel
  );
  await channel.delete();
}
