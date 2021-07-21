import { Guild } from 'discord.js';
import { ChangePermissionOverrideAction, ResolvedChangePermissionOverrideAction } from "athena-common";
import {
  ResourceList,
  decacheChannelReference,
  decacheUserOrRoleReference,
  unwrapPermission
} from '@/action/executor';
import {
  ActionValidationResult,
  validateChannelReference,
  validateUserOrRoleReference,
} from '@/action/validator';
import {
  ResolutionList,
  resolveChannelReference,
  resolveUserOrRoleReference
} from '@/resolver';

export async function validateChangePermissionOverrideAction(
  guild: Guild,
  action: ChangePermissionOverrideAction
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
export async function resolveChangePermissionOverrideAction(
  guild: Guild,
  action: ChangePermissionOverrideAction,
  resList: ResolutionList
): Promise<ResolvedChangePermissionOverrideAction> {
  return {
    ...action,
    channel: await resolveChannelReference(guild, resList, action.channel),
    subject: await resolveUserOrRoleReference(guild, resList, action.subject),
  };
}
export async function executeChangePermissionOverrideAction(
  guild: Guild,
  action: ChangePermissionOverrideAction,
  resourceList: ResourceList
) {
  const channel = await decacheChannelReference(
    guild,
    resourceList,
    action.channel
  );
  const subject = await decacheUserOrRoleReference(
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
