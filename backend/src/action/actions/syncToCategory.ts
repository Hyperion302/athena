import { Guild } from 'discord.js';
import { ResolvedSyncToCategoryAction, SyncToCategoryAction } from "athena-common";
import { decacheChannelReference, ResourceList } from '@/action/executor';
import { ActionValidationResult, validateChannelReference } from '@/action/validator';
import { ResolutionList, resolveChannelReference} from '@/resolver';

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
export async function resolveSyncToCategoryAction(
  guild: Guild,
  action: SyncToCategoryAction,
  resList: ResolutionList
): Promise<ResolvedSyncToCategoryAction> {
  return {
    ...action,
    channel: await resolveChannelReference(guild, resList, action.channel)
  };
}
export async function executeSyncToCategoryAction(
  guild: Guild,
  action: SyncToCategoryAction,
  resourceList: ResourceList
) {
  const channel = await decacheChannelReference(
    guild,
    resourceList,
    action.channel
  );
  await channel.lockPermissions();
}
