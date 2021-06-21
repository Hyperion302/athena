import { createToken, IToken } from 'chevrotain';
import { Guild, Role } from 'discord.js';
import { Action } from '..';
import { ResourceList } from '../executor';
import { PlainText } from '../lexer';
import { ActionValidationResult } from '../validator';

export interface CreateRoleAction {
  action: Action.CreateRole;
  name: string;
}
export const createRoleToken = createToken({
  name: Action.CreateRole,
  pattern: new RegExp(Action.CreateRole),
  longer_alt: PlainText,
});
export function parseCreateRoleAction(tokens: IToken[]): CreateRoleAction {
  const roleName = tokens
    .map((token) => token.image)
    .slice(1)
    .join(' ');
  return {
    action: Action.CreateRole,
    name: roleName,
  };
}
export async function validateCreateRoleAction(
  guild: Guild,
  action: CreateRoleAction
): Promise<ActionValidationResult> {
  return { valid: true, referenceValidations: [] };
}
export async function executeCreateRoleAction(
  guild: Guild,
  action: CreateRoleAction
): Promise<Role> {
  return await guild.roles.create({
    data: { name: action.name },
  });
}
