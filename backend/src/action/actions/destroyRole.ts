import { Guild } from 'discord.js';
import { DestroyRoleAction, ReferenceType } from "athena-common";
import { ResourceList, resolveRoleReference } from '@/action/executor';
import { ActionValidationResult, validateRoleReference } from '@/action/validator';

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
export async function executeDestroyRoleAction(
  guild: Guild,
  action: DestroyRoleAction,
  resourceList: ResourceList
) {
  const role = await resolveRoleReference(guild, resourceList, action.role);
  await role.delete();
  if (action.role.type == ReferenceType.Pointer) {
    delete resourceList[action.role.index];
  }
}
