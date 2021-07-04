import { Channel, Guild } from 'discord.js';
import { CreateChannelAction, ChannelType } from "athena-common";
import { ActionValidationResult } from '@/action/validator';

export async function validateCreateChannelAction(): Promise<ActionValidationResult> {
  return {
    valid: true,
    referenceValidations: [],
  };
}

const toDJS: {
  [ChannelType.Text]: "text",
  [ChannelType.Voice]: "voice",
  [ChannelType.Category]: "category"
} = {
  [ChannelType.Text]: "text",
  [ChannelType.Voice]: "voice",
  [ChannelType.Category]: "category"
}

export async function executeCreateChannelAction(
  guild: Guild,
  action: CreateChannelAction
): Promise<Channel> {

  return await guild.channels.create(action.name, {
    type: toDJS[action.type],
  });
}
