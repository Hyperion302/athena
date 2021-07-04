import { Guild } from 'discord.js';
import { DestroyRoleAction, ReferenceType, ResolvedDestroyRoleAction } from "athena-common";
import { ResourceList, decacheRoleReference } from '@/action/executor';
import { ActionValidationResult, validateRoleReference } from '@/action/validator';
import {nameToRef, ResolutionList, resolveRoleReference} from '../resolver';

export async function validateDestroyRoleAction(
  guild: Guild,
  action: DestroyRoleAction
): Promise<ActionValidationResult> {
  const roleValidation = await validateRoleReference(guild, action.role);
  return {
    valid: roleValidation.valid,
    referenceValidations: [roleValidation],
  };
}
export async function resolveDestroyRoleAction(
  guild: Guild,
  action: DestroyRoleAction,
  resList: ResolutionList
): Promise<ResolvedDestroyRoleAction> {
  return {
    ...action,
    role: nameToRef(await resolveRoleReference(guild, resList, action.role))
  }
}
export async function executeDestroyRoleAction(
  guild: Guild,
  action: DestroyRoleAction,
  resourceList: ResourceList
) {
  const role = await decacheRoleReference(guild, resourceList, action.role);
  await role.delete();
  if (action.role.type == ReferenceType.Pointer) {
    delete resourceList[action.role.index];
  }
}
