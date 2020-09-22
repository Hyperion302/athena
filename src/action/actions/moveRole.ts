import { createToken, IToken } from 'chevrotain';
import { Guild } from 'discord.js';
import { ActionSyntaxError } from '../../errors';
import { Action, ResourceReference, MoveRelativePosition } from '..';
import { resolveRoleReference, ResourceList } from '../executor';
import { PlainText } from '../lexer';
import { parseRoleToken } from '../parser';
import { ActionValidationResult, validateRoleReference } from '../validator';

export interface MoveRoleAction {
  action: Action.MoveRole;
  role: ResourceReference;
  direction: MoveRelativePosition;
  subject: ResourceReference;
}
export const moveRoleToken = createToken({
  name: Action.MoveRole,
  pattern: new RegExp(Action.MoveRole),
  longer_alt: PlainText,
});
export function parseMoveRoleAction(tokens: IToken[]): MoveRoleAction {
  const roleRef = parseRoleToken(tokens[1]);
  const subjectRef = parseRoleToken(tokens[3]);
  let direction: MoveRelativePosition;
  if (tokens[2].image == MoveRelativePosition.Above) {
    direction = MoveRelativePosition.Above;
  } else if (tokens[2].image == MoveRelativePosition.Below) {
    direction = MoveRelativePosition.Below;
  } else {
    throw new ActionSyntaxError(`Unrecognized direction ${tokens[2].image}`);
  }
  return {
    action: Action.MoveRole,
    role: roleRef,
    direction,
    subject: subjectRef,
  };
}
export async function validateMoveRoleAction(
  guild: Guild,
  action: MoveRoleAction
): Promise<ActionValidationResult> {
  const roleValidation = await validateRoleReference(guild, action.role);
  const subjectValidation = await validateRoleReference(guild, action.subject);
  return {
    valid: roleValidation.valid && subjectValidation.valid,
    referenceValidations: [roleValidation, subjectValidation],
  };
}
export async function executeMoveRoleAction(
  guild: Guild,
  action: MoveRoleAction,
  resourceList: ResourceList
) {
  const role = await resolveRoleReference(guild, resourceList, action.role);
  const relativeTo = await resolveRoleReference(
    guild,
    resourceList,
    action.subject
  );
  const subjectPos = relativeTo.position;
  let newPos = 0;
  switch (action.direction) {
    case MoveRelativePosition.Above:
      newPos = subjectPos; // Setting the same position will force the stack downwards
      break;
    case MoveRelativePosition.Below:
      newPos = subjectPos - 1;
      newPos = Math.max(newPos, 0); // Clamp at 0
      break;
  }
  await role.setPosition(newPos);
}
