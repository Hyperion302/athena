import { Guild } from 'discord.js';
import { KickAction, ReferenceType, ResolvedKickAction } from "athena-common";
import { decacheUserReference } from '@/action/executor';
import { ActionValidationResult, validateUserReference } from '@/action/validator';
import {nameToRef, resolveUserReference} from '../resolver';

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
export async function resolveKickAction(
  guild: Guild,
  action: KickAction
): Promise<ResolvedKickAction> {
  return {
    ...action,
    user: nameToRef(await resolveUserReference(guild, action.user))
  };
}
export async function executeKickAction(guild: Guild, action: KickAction) {
  const user = await decacheUserReference(guild, action.user);
  await user.kick();
}
