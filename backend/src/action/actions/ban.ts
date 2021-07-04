import { Guild } from 'discord.js';
import { BanAction, ReferenceType, ResolvedBanAction } from "athena-common";
import { decacheUserReference } from '@/action/executor';
import { ActionValidationResult, validateUserReference } from '@/action/validator';
import { nameToRef, ResolutionList, resolveUserReference } from '@/action/resolver';

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
export async function resolveBanAction(
  guild: Guild,
  action: BanAction,
  resList: ResolutionList
): Promise<ResolvedBanAction> {
  return {
    ...action,
    user: nameToRef(await resolveUserReference(guild, action.user))
  }
}
export async function executeBanAction(guild: Guild, action: BanAction) {
  const user = await decacheUserReference(guild, action.user);
  await user.ban();
}
