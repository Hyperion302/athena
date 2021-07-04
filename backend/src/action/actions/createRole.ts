import { Guild, Role } from 'discord.js';
import { CreateRoleAction, ResolvedCreateRoleAction } from "athena-common";
import { ActionValidationResult } from '../validator';
import {ResolutionList} from '../resolver';

export async function validateCreateRoleAction(
  guild: Guild,
  action: CreateRoleAction
): Promise<ActionValidationResult> {
  return { valid: true, referenceValidations: [] };
}
export async function resolveCreateRoleAction(
  guild: Guild,
  action: CreateRoleAction,
  resList: ResolutionList
): Promise<ResolvedCreateRoleAction> { return action; }
export async function executeCreateRoleAction(
  guild: Guild,
  action: CreateRoleAction
): Promise<Role> {
  return await guild.roles.create({
    data: { name: action.name },
  });
}
