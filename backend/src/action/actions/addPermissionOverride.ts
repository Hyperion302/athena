import { Guild } from 'discord.js';
import { AddPermissionOverrideAction } from "athena-common";
import {
  unwrapPermission,
  resolveChannelReference,
  resolveUserOrRoleReference,
  ResourceList,
} from '@/action/executor';
import {
  ActionValidationResult,
  validateChannelReference,
  validateUserOrRoleReference,
} from '@/action/validator';

export async function validateAddPermissionOverrideAction(
  guild: Guild,
  action: AddPermissionOverrideAction
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
export async function executeAddPermissionOverrideAction(
  guild: Guild,
  action: AddPermissionOverrideAction,
  resourceList: ResourceList
) {
  const channel = await resolveChannelReference(
    guild,
    resourceList,
    action.channel
  );
  const subject = await resolveUserOrRoleReference(
    guild,
    resourceList,
    action.subject
  );
  const overwrites: { [key: string]: boolean } = {};
  unwrapPermission(action.allow).forEach((permission) => {
    overwrites[permission] = true;
  });
  unwrapPermission(action.unset).forEach((permission) => {
    overwrites[permission] = null;
  });
  unwrapPermission(action.deny).forEach((permission) => {
    overwrites[permission] = false;
  });
  await channel.createOverwrite(subject, overwrites);
}
