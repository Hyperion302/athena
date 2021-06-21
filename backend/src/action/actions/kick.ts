import { createToken, IToken } from 'chevrotain';
import { Guild } from 'discord.js';
import { Action, ResourceReference } from '..';
import { resolveUserReference, ResourceList } from '../executor';
import { PlainText } from '../lexer';
import { parseUserToken } from '../parser';
import { ActionValidationResult, validateUserReference } from '../validator';

export interface KickAction {
  action: Action.Kick;
  user: ResourceReference;
}

export const kickToken = createToken({
  name: Action.Kick,
  pattern: new RegExp(Action.Kick),
  longer_alt: PlainText,
});
export function parseKickAction(tokens: IToken[]): KickAction {
  return {
    action: Action.Kick,
    user: parseUserToken(tokens[1]),
  };
}
export async function validateKickAction(
  guild: Guild,
  action: KickAction
): Promise<ActionValidationResult> {
  const userValidation = await validateUserReference(guild, action.user);
  return {
    valid: userValidation.valid,
    referenceValidations: [userValidation],
  };
}
export async function executeKickAction(guild: Guild, action: KickAction) {
  const user = await resolveUserReference(guild, action.user);
  await user.kick();
}
