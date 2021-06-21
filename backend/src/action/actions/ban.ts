import { createToken, IToken } from 'chevrotain';
import { Guild } from 'discord.js';
import { Action, ResourceReference } from '..';
import { resolveUserReference } from '../executor';
import { PlainText } from '../lexer';
import { parseUserToken } from '../parser';
import { ActionValidationResult, validateUserReference } from '../validator';

export interface BanAction {
  action: Action.Ban;
  user: ResourceReference;
}

export const banToken = createToken({
  name: Action.Ban,
  pattern: new RegExp(Action.Ban),
  longer_alt: PlainText,
});
export function parseBanAction(tokens: IToken[]): BanAction {
  return {
    action: Action.Ban,
    user: parseUserToken(tokens[1]),
  };
}
export async function validateBanAction(
  guild: Guild,
  action: BanAction
): Promise<ActionValidationResult> {
  const userValidation = await validateUserReference(guild, action.user);
  return {
    valid: userValidation.valid,
    referenceValidations: [userValidation],
  };
}
export async function executeBanAction(guild: Guild, action: BanAction) {
  const user = await resolveUserReference(guild, action.user);
  await user.ban();
}
