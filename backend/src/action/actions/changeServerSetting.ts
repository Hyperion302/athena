import { Guild } from 'discord.js';
import { ServerSetting, ChangeServerSettingAction, ResolvedChangeServerSettingAction } from "athena-common";
import { ExecutionError } from '@/errors';
import { decacheChannelReference, ResourceList } from '@/action/executor';
import { ActionValidationResult, validateChannelReference } from '@/action/validator';
import { ResolutionList, resolveChannelReference } from '@/resolver';

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
export async function resolveChangeServerSettingAction(
  guild: Guild,
  action: ChangeServerSettingAction,
  resList: ResolutionList
): Promise<ResolvedChangeServerSettingAction> {
  switch (action.setting) {
    case ServerSetting.AFKChannel:
      return {
        ...action,
        value: await resolveChannelReference(guild, resList, action.value)
      };
    default:
      return action;
  }
}
export async function executeChangeServerSettingAction(
  guild: Guild,
  action: ChangeServerSettingAction,
  resourceList: ResourceList,
  i: number
) {
  switch (action.setting) {
    case ServerSetting.AFKChannel:
      const afkChannel = await decacheChannelReference(
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
