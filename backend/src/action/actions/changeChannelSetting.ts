import { Guild } from 'discord.js';
import { ChangeChannelSettingAction, ChannelSetting, ReferenceType, ResolvedChangeChannelSettingAction } from "athena-common";
import { decacheChannelReference, ResourceList } from '@/action/executor';
import { ActionValidationResult, validateChannelReference } from '@/action/validator';
import { nameToRef, ResolutionList, resolveChannelReference } from '@/action/resolver';

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
export async function resolveChangeChannelSettingAction(
  guild: Guild,
  action: ChangeChannelSettingAction,
  resList: ResolutionList
): Promise<ResolvedChangeChannelSettingAction> {
  return {
    ...action,
    channel: nameToRef(await resolveChannelReference(guild, resList, action.channel))
  }
}
export async function executeChangeChannelSettingAction(
  guild: Guild,
  action: ChangeChannelSettingAction,
  resourceList: ResourceList
) {
  const channel = await decacheChannelReference(
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
