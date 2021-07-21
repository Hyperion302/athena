import { Guild } from 'discord.js';
import { DestroyChannelAction, ResolvedDestroyChannelAction } from "athena-common";
import { decacheChannelReference, ResourceList } from '@/action/executor';
import { ActionValidationResult, validateChannelReference } from '@/action/validator';
import { ResolutionList, resolveChannelReference } from '@/resolver';

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
export async function resolveDestroyChannelAction(
  guild: Guild,
  action: DestroyChannelAction,
  resList: ResolutionList
): Promise<ResolvedDestroyChannelAction> {
  return {
    ...action,
    channel: await resolveChannelReference(guild, resList, action.channel)
  };
}
export async function executeDestroyChannelAction(
  guild: Guild,
  action: DestroyChannelAction,
  resourceList: ResourceList
) {
  const channel = await decacheChannelReference(
    guild,
    resourceList,
    action.channel
  );
  await channel.delete();
}
