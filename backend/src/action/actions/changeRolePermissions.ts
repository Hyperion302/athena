import { Guild } from 'discord.js';
import { ChangeRolePermissionsAction, ResolvedChangeRolePermissionsAction } from "athena-common";
import { decacheRoleReference, ResourceList } from '@/action/executor';
import { ActionValidationResult, validateRoleReference } from '@/action/validator';
import { ResolutionList, resolveRoleReference } from '@/resolver';

export async function validateChangeRolePermissionsAction(
  guild: Guild,
  action: ChangeRolePermissionsAction
): Promise<ActionValidationResult> {
  const roleValidation = await validateRoleReference(guild, action.role);
  return {
    valid: roleValidation.valid,
    referenceValidations: [roleValidation],
  };
}
export async function resolveChangeRolePermissionsAction(
  guild: Guild,
  action: ChangeRolePermissionsAction,
  resList: ResolutionList
): Promise<ResolvedChangeRolePermissionsAction> {
  return {
    ...action,
    role: await resolveRoleReference(guild, resList, action.role)
  };
}
export async function executeChangeRolePermissionsAction(
  guild: Guild,
  action: ChangeRolePermissionsAction,
  resourceList: ResourceList
) {
  const role = await decacheRoleReference(guild, resourceList, action.role);
  let permissionBits = role.permissions.add(action.allow).remove(action.deny);
  await role.setPermissions(permissionBits);
}
