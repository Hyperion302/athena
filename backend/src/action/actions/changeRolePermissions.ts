import { Guild } from 'discord.js';
import { ChangeRolePermissionsAction } from "athena-common";
import { resolveRoleReference, ResourceList } from '../executor';
import { ActionValidationResult, validateRoleReference } from '../validator';

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
export async function executeChangeRolePermissionsAction(
  guild: Guild,
  action: ChangeRolePermissionsAction,
  resourceList: ResourceList
) {
  const role = await resolveRoleReference(guild, resourceList, action.role);
  let permissionBits = role.permissions.add(action.allow).remove(action.deny);
  await role.setPermissions(permissionBits);
}
