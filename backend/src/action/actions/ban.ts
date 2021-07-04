import { Guild } from 'discord.js';
import { BanAction } from "athena-common";
import { resolveUserReference } from '@/action/executor';
import { ActionValidationResult, validateUserReference } from '@/action/validator';

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
