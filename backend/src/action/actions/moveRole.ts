import { Guild } from 'discord.js';
import { MoveRoleAction, MoveRelativePosition, ResolvedMoveRoleAction } from "athena-common";
import { decacheRoleReference, ResourceList } from '../executor';
import { ActionValidationResult, validateRoleReference } from '../validator';
import { ResolutionList, resolveRoleReference} from '@/resolver';

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
export async function resolveMoveRoleAction(
  guild: Guild,
  action: MoveRoleAction,
  resList: ResolutionList
): Promise<ResolvedMoveRoleAction> {
  return {
    ...action,
    role: await resolveRoleReference(guild, resList, action.role),
    subject: await resolveRoleReference(guild, resList, action.subject)
  };
}
export async function executeMoveRoleAction(
  guild: Guild,
  action: MoveRoleAction,
  resourceList: ResourceList
) {
  const role = await decacheRoleReference(guild, resourceList, action.role);
  const relativeTo = await decacheRoleReference(
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
