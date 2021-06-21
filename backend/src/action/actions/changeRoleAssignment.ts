import { createToken, IToken } from 'chevrotain';
import { Guild } from 'discord.js';
import { ActionSyntaxError } from '../../errors';
import { Action, ActionValidationResult, ResourceReference } from '..';
import {
  resolveRoleReference,
  resolveUserReference,
  ResourceList,
} from '../executor';
import { PlainText } from '../lexer';
import { parseRoleToken, parseUserToken } from '../parser';
import { validateRoleReference, validateUserReference } from '../validator';

export interface ChangeRoleAssignmentAction {
  action: Action.ChangeRoleAssignment;
  role: ResourceReference;
  grant: ResourceReference[];
  revoke: ResourceReference[];
}
export const changeRoleAssignmentToken = createToken({
  name: Action.ChangeRoleAssignment,
  pattern: new RegExp(Action.ChangeRoleAssignment),
  longer_alt: PlainText,
});
export const grantRoleToken = createToken({
  name: Action.GrantRole,
  pattern: new RegExp(Action.GrantRole),
  longer_alt: PlainText,
});
export const revokeRoleToken = createToken({
  name: Action.RevokeRole,
  pattern: new RegExp(Action.RevokeRole),
  longer_alt: PlainText,
});
export function parseChangeRoleAssignmentAction(
  tokens: IToken[]
): ChangeRoleAssignmentAction {
  const roleRef = parseRoleToken(tokens[1]);
  const assignmentTokens = tokens.slice(2);
  const grants: ResourceReference[] = [],
    revocations: ResourceReference[] = [];
  if (!assignmentTokens || !assignmentTokens.length) {
    throw new ActionSyntaxError('Must provide assignments');
  }
  if (assignmentTokens.length % 2 != 0) {
    // Odd # means something's wrong
    throw new ActionSyntaxError('Malformed assignment list');
  }
  for (let i = 0; i < assignmentTokens.length; i += 2) {
    const userRef = parseUserToken(assignmentTokens[i + 1]);
    if (assignmentTokens[i].tokenType.name == 'Cross') {
      grants.push(userRef);
    }
    if (assignmentTokens[i].tokenType.name == 'Dash') {
      revocations.push(userRef);
    }
  }
  return {
    action: Action.ChangeRoleAssignment,
    role: roleRef,
    grant: grants,
    revoke: revocations,
  };
}
export function parseRevokeRoleAction(
  tokens: IToken[]
): ChangeRoleAssignmentAction {
  const roleRef = parseRoleToken(tokens[1]);
  const revokeTokens = tokens.slice(2);
  if (!revokeTokens || !revokeTokens.length) {
    throw new ActionSyntaxError('Must provide roles');
  }
  const revocations = revokeTokens.map(parseUserToken);
  return {
    action: Action.ChangeRoleAssignment,
    role: roleRef,
    grant: [],
    revoke: revocations,
  };
}
export function parseGrantRoleAction(
  tokens: IToken[]
): ChangeRoleAssignmentAction {
  const roleRef = parseRoleToken(tokens[1]);
  const grantTokens = tokens.slice(2);
  if (!grantTokens || !grantTokens.length) {
    throw new ActionSyntaxError('Must provide roles');
  }
  const grants = grantTokens.map(parseUserToken);
  return {
    action: Action.ChangeRoleAssignment,
    role: roleRef,
    grant: grants,
    revoke: [],
  };
}
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
