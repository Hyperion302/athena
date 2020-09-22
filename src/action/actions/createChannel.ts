import { createToken, IToken } from 'chevrotain';
import { Channel, Guild } from 'discord.js';
import { ActionSyntaxError } from '../../errors';
import {
  Action,
  MIN_CHANNEL_LENGTH,
  MAX_CHANNEL_LENGTH,
  ChannelType,
} from '..';
import { PlainText } from '../lexer';
import { ActionValidationResult } from '../validator';

export interface CreateChannelAction {
  action: Action.CreateChannel;
  name: string;
  type: ChannelType;
}
export const createChannelToken = createToken({
  name: Action.CreateRole,
  pattern: new RegExp(Action.CreateRole),
  longer_alt: PlainText,
});
export function parseCreateChannelAction(
  tokens: IToken[]
): CreateChannelAction {
  let name = tokens
    .slice(2)
    .map((token) => token.image)
    .join(' ');
  let type: ChannelType;
  if (tokens[1].image == ChannelType.Text) {
    type = ChannelType.Text;
    name = name.toLowerCase().replace(' ', '-');
  } else if (tokens[1].image == ChannelType.Voice) {
    type = ChannelType.Voice;
  } else if (tokens[1].image == ChannelType.Category) {
    type = ChannelType.Category;
  } else {
    throw new ActionSyntaxError(`Unrecognized channel type ${tokens[1].image}`);
  }
  if (name.length < MIN_CHANNEL_LENGTH || name.length > MAX_CHANNEL_LENGTH) {
    throw new ActionSyntaxError(
      `Channel name too long or too short (${MIN_CHANNEL_LENGTH}-${MAX_CHANNEL_LENGTH})`
    );
  }
  return {
    action: Action.CreateChannel,
    name,
    type,
  };
}
export async function validateCreateChannelAction(
  guild: Guild,
  action: CreateChannelAction
): Promise<ActionValidationResult> {
  return {
    valid: true,
    referenceValidations: [],
  };
}
export async function executeCreateChannelAction(
  guild: Guild,
  action: CreateChannelAction
): Promise<Channel> {
  return await guild.channels.create(action.name, {
    type: action.type,
  });
}
