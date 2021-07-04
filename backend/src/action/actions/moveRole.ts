import { Guild } from 'discord.js';
import { MoveRoleAction, MoveRelativePosition } from "athena-common";
import { resolveRoleReference, ResourceList } from '../executor';
import { ActionValidationResult, validateRoleReference } from '../validator';

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
