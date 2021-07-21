import { Guild, Role } from 'discord.js';
import { CreateRoleAction, ResolvedCreateRoleAction } from "athena-common";
import { ActionValidationResult } from '@/action/validator';

export async function validateCreateRoleAction(
  guild: Guild,
  action: CreateRoleAction
): Promise<ActionValidationResult> {
  return { valid: true, referenceValidations: [] };
}
export async function resolveCreateRoleAction(
  guild: Guild,
  action: CreateRoleAction
): Promise<ResolvedCreateRoleAction> { return action; }
export async function executeCreateRoleAction(
  guild: Guild,
  action: CreateRoleAction
): Promise<Role> {
  return await guild.roles.create({
    data: { name: action.name },
  });
}
