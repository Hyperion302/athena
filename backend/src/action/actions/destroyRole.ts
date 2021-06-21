import { createToken, IToken } from 'chevrotain';
import { Guild } from 'discord.js';
import { tAction } from '.';
import { Action, ReferenceType, ResourceReference } from '..';
import { ResourceList, resolveRoleReference } from '../executor';
import { PlainText } from '../lexer';
import { parseRoleToken } from '../parser';
import { ActionValidationResult, validateRoleReference } from '../validator';

export interface DestroyRoleAction {
  action: Action.DestroyRole;
  role: ResourceReference;
}
export const destroyRoleToken = createToken({
  name: Action.DestroyRole,
  pattern: new RegExp(Action.DestroyRole),
  longer_alt: PlainText,
});
export function parseDestroyRoleAction(tokens: IToken[]): DestroyRoleAction {
  return {
    action: Action.DestroyRole,
    role: parseRoleToken(tokens[1]),
  };
}
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
