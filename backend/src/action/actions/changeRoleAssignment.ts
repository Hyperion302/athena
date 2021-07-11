import { Guild } from 'discord.js';
import { ActionValidationResult } from '@/action';
import { ResolvedChangeRoleAssignmentAction, ChangeRoleAssignmentAction, ReferenceType } from "athena-common";
import {
  decacheRoleReference,
  decacheUserReference,
  ResourceList,
} from '@/action/executor';
import { validateRoleReference, validateUserReference } from '@/action/validator';
import {
  ResolutionList,
  resolveUserReference,
  resolveRoleReference
} from '@/resolver';

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
export async function resolveChangeRoleAssignmentAction(
  guild: Guild,
  action: ChangeRoleAssignmentAction,
  resList: ResolutionList
): Promise<ResolvedChangeRoleAssignmentAction> {
  const grant = await Promise.all(
    action.grant.map((grant) => resolveUserReference(guild, grant))
  );
  const revoke = await Promise.all(
    action.revoke.map((revoke) => resolveUserReference(guild, revoke))
  );
  return {
    ...action,
    grant,
    revoke,
    role: await resolveRoleReference(guild, resList, action.role)
  }
}
export async function executeChangeRoleAssignmentAction(
  guild: Guild,
  action: ChangeRoleAssignmentAction,
  resourceList: ResourceList
) {
  const role = await decacheRoleReference(guild, resourceList, action.role);
  const grantPromises = action.grant.map(async (user) => {
    const resolvedUser = await decacheUserReference(guild, user);
    await resolvedUser.roles.add(role);
  });
  const revokePromises = action.revoke.map(async (user) => {
    const resolvedUser = await decacheUserReference(guild, user);
    await resolvedUser.roles.remove(role);
  });
  await Promise.all([...grantPromises, ...revokePromises]);
}
