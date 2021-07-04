import { Guild } from 'discord.js';
import { KickAction } from "athena-common";
import { resolveUserReference } from '@/action/executor';
import { ActionValidationResult, validateUserReference } from '@/action/validator';

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
