import { createToken, IToken } from 'chevrotain';
import { Guild } from 'discord.js';
import { ActionSyntaxError } from '../../errors';
import { Action, ResourceReference } from '..';
import { resolveRoleReference, ResourceList } from '../executor';
import { PlainText } from '../lexer';
import { parseRoleToken, parsePermissionToken } from '../parser';
import { ActionValidationResult, validateRoleReference } from '../validator';

export interface ChangeRolePermissionsAction {
  action: Action.ChangeRolePermissions;
  role: ResourceReference;
  allow: number[];
  deny: number[];
}
export const changeRolePermissionsToken = createToken({
  name: Action.ChangeRolePermissions,
  pattern: new RegExp(Action.ChangeRolePermissions),
  longer_alt: PlainText,
});
export const allowPermissionsToken = createToken({
  name: Action.AllowPermissions,
  pattern: new RegExp(Action.AllowPermissions),
  longer_alt: PlainText,
});
export const prohibitPermissionsToken = createToken({
  name: Action.DenyPermissions,
  pattern: new RegExp(Action.DenyPermissions),
  longer_alt: PlainText,
});
export function parseChangeRolePermissionsAction(
  tokens: IToken[]
): ChangeRolePermissionsAction {
  const roleRef = parseRoleToken(tokens[1]);
  const permissionTokens = tokens.slice(2);
  const allow: number[] = [],
    deny: number[] = [];
  if (!permissionTokens || !permissionTokens.length) {
    throw new ActionSyntaxError('Must provide permissions');
  }
  if (permissionTokens.length % 2 != 0) {
    throw new ActionSyntaxError('Malformed permission list');
  }
  for (let i = 0; i < permissionTokens.length; i += 2) {
    const permission = parsePermissionToken(permissionTokens[i + 1]);
    const modeTokenName = permissionTokens[i].tokenType.name;
    if (modeTokenName == 'Cross') {
      allow.push(permission);
    }
    if (modeTokenName == 'Dash') {
      deny.push(permission);
    }
  }
  return {
    action: Action.ChangeRolePermissions,
    role: roleRef,
    allow,
    deny,
  };
}
export function parseAllowPermissions(
  tokens: IToken[]
): ChangeRolePermissionsAction {
  const roleRef = parseRoleToken(tokens[1]);
  const permissionTokens = tokens.slice(2);
  if (!permissionTokens || !permissionTokens.length) {
    throw new ActionSyntaxError('Must provide permissions');
  }
  const permissions = permissionTokens.map(parsePermissionToken);
  return {
    action: Action.ChangeRolePermissions,
    role: roleRef,
    allow: permissions,
    deny: [],
  };
}
export function parseDenyPermissions(
  tokens: IToken[]
): ChangeRolePermissionsAction {
  const roleRef = parseRoleToken(tokens[1]);
  const permissionTokens = tokens.slice(2);
  if (!permissionTokens || !permissionTokens.length) {
    throw new ActionSyntaxError('Must provide permissions');
  }
  const permissions = permissionTokens.map(parsePermissionToken);
  return {
    action: Action.ChangeRolePermissions,
    role: roleRef,
    allow: [],
    deny: permissions,
  };
}
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
  let permissionBits = role.permissions;
  action.allow.forEach(
    (permission) => (permissionBits = permissionBits.add(permission))
  );
  action.deny.forEach(
    (permission) => (permissionBits = permissionBits.remove(permission))
  );
  await role.setPermissions(permissionBits);
}
