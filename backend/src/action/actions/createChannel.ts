import { Channel, Guild } from 'discord.js';
import { CreateChannelAction, ChannelType, ResolvedCreateChannelAction } from "athena-common";
import { ActionValidationResult } from '@/action/validator';
import {ResolutionList} from '../resolver';

export async function validateCreateChannelAction(): Promise<ActionValidationResult> {
  return {
    valid: true,
    referenceValidations: [],
  };
}

export async function resolveCreateChannelAction(
  guild: Guild,
  action: CreateChannelAction,
  resList: ResolutionList
): Promise<ResolvedCreateChannelAction> { return action; }

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
