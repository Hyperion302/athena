import { Guild } from 'discord.js';
import { ChangeChannelSettingAction, ChannelSetting } from "athena-common";
import { resolveChannelReference, ResourceList } from '@/action/executor';
import { ActionValidationResult, validateChannelReference } from '@/action/validator';

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
