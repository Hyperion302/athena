import { Guild, Role } from 'discord.js';
import { CreateRoleAction } from "athena-common";
import { ActionValidationResult } from '../validator';

export async function validateCreateRoleAction(
  guild: Guild,
  action: CreateRoleAction
): Promise<ActionValidationResult> {
  return { valid: true, referenceValidations: [] };
}
export async function executeCreateRoleAction(
  guild: Guild,
  action: CreateRoleAction
): Promise<Role> {
  return await guild.roles.create({
    data: { name: action.name },
  });
}
