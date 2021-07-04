import { Guild } from 'discord.js';
import { ActionValidationResult } from '@/action';
import { ChangeRoleAssignmentAction } from "athena-common";
import {
  resolveRoleReference,
  resolveUserReference,
  ResourceList,
} from '@/action/executor';
import { validateRoleReference, validateUserReference } from '@/action/validator';

export async function validateChangeRoleAssignmentAction(
  guild: Guild,
  action: ChangeRoleAssignmentAction
): Promise<ActionValidationResult> {
  const roleValidation = await validateRoleReference(guild, action.role);
  const grantValidation = await Promise.all(
    action.grant.map((grant) => validateUserReference(guild, grant))
  );
  const revokeValidation = await Promise.all(
    action.revoke.map((grant) => validateUserReference(guild, grant))
  );
  const validations = [roleValidation, ...grantValidation, ...revokeValidation];
  return {
    valid: validations.every((validation) => validation.valid),
    referenceValidations: validations,
  };
}
export async function executeChangeRoleAssignmentAction(
  guild: Guild,
  action: ChangeRoleAssignmentAction,
  resourceList: ResourceList
) {
  const role = await resolveRoleReference(guild, resourceList, action.role);
  const grantPromises = action.grant.map(async (user) => {
    const resolvedUser = await resolveUserReference(guild, user);
    await resolvedUser.roles.add(role);
  });
  const revokePromises = action.revoke.map(async (user) => {
    const resolvedUser = await resolveUserReference(guild, user);
    await resolvedUser.roles.remove(role);
  });
  await Promise.all([...grantPromises, ...revokePromises]);
}
