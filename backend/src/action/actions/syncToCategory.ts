import { Guild } from 'discord.js';
import { SyncToCategoryAction } from "athena-common";
import { resolveChannelReference, ResourceList } from '@/action/executor';
import { ActionValidationResult, validateChannelReference } from '@/action/validator';

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
