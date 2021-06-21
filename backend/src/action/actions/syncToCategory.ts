import { createToken, IToken } from 'chevrotain';
import { Guild } from 'discord.js';
import { Action, ResourceReference } from '..';
import { resolveChannelReference, ResourceList } from '../executor';
import { PlainText } from '../lexer';
import { parseChannelToken } from '../parser';
import { ActionValidationResult, validateChannelReference } from '../validator';

export interface SyncToCategoryAction {
  action: Action.SyncToCategory;
  channel: ResourceReference;
}
export const syncToCategoryToken = createToken({
  name: Action.SyncToCategory,
  pattern: new RegExp(Action.SyncToCategory),
  longer_alt: PlainText,
});
export function parseSyncToCategoryAction(
  tokens: IToken[]
): SyncToCategoryAction {
  return {
    action: Action.SyncToCategory,
    channel: parseChannelToken(tokens[1]),
  };
}
export async function validateSyncToCategoryAction(
  guild: Guild,
  action: SyncToCategoryAction
): Promise<ActionValidationResult> {
  const channelValidation = validateChannelReference(guild, action.channel);
  return {
    valid: channelValidation.valid,
    referenceValidations: [channelValidation],
  };
}
export async function executeSyncToCategoryAction(
  guild: Guild,
  action: SyncToCategoryAction,
  resourceList: ResourceList
) {
  const channel = await resolveChannelReference(
    guild,
    resourceList,
    action.channel
  );
  await channel.lockPermissions();
}
