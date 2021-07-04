import { Guild } from 'discord.js';
import { RemovePermissionOverrideAction } from "athena-common";
import {
  resolveChannelReference,
  resolveUserOrRoleReference,
  ResourceList,
} from '@/action/executor';
import {
  ActionValidationResult,
  validateChannelReference,
  validateUserOrRoleReference,
} from '@/action/validator';

export async function validateRemovePermissionOverrideAction(
  guild: Guild,
  action: RemovePermissionOverrideAction
): Promise<ActionValidationResult> {
  const channelValidation = validateChannelReference(guild, action.channel);
  const subjectValidation = await validateUserOrRoleReference(
    guild,
    action.subject
  );
  return {
    valid: channelValidation.valid && subjectValidation.valid,
    referenceValidations: [channelValidation, subjectValidation],
  };
}
export async function executeRemovePermissionOverrideAction(
  guild: Guild,
  action: RemovePermissionOverrideAction,
  resourceList: ResourceList
) {
  const channel = await resolveChannelReference(
    guild,
    resourceList,
    action.channel
  );
  const removeSubject = await resolveUserOrRoleReference(
    guild,
    resourceList,
    action.subject
  );
  const overwrites = channel.permissionOverwrites;
  overwrites.delete(removeSubject.id);
  await channel.overwritePermissions(overwrites);
}
