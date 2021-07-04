import { Guild } from 'discord.js';
import { DestroyChannelAction } from "athena-common";
import { resolveChannelReference, ResourceList } from '../executor';
import { ActionValidationResult, validateChannelReference } from '../validator';

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
