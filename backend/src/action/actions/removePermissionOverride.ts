import { createToken, IToken } from 'chevrotain';
import { Guild } from 'discord.js';
import { ActionSyntaxError } from '../../errors';
import { Action, ResourceReference } from '..';
import {
  resolveChannelReference,
  resolveUserOrRoleReference,
  ResourceList,
} from '../executor';
import { PlainText } from '../lexer';
import { parseChannelToken, parseSubjectToken } from '../parser';
import {
  ActionValidationResult,
  validateChannelReference,
  validateUserOrRoleReference,
} from '../validator';

export interface RemovePermissionOverrideAction {
  action: Action.RemovePermissionOverrideOn;
  channel: ResourceReference;
  subject: ResourceReference; // Role or user
}
export const removePermissionOverrideToken = createToken({
  name: Action.RemovePermissionOverrideOn,
  pattern: new RegExp(Action.RemovePermissionOverrideOn),
  longer_alt: PlainText,
});
export function parseRemovePermissionOverrideAction(
  tokens: IToken[]
): RemovePermissionOverrideAction {
  const channelRef = parseChannelToken(tokens[1]);
  if (tokens[2].tokenType.name != 'For') {
    throw new ActionSyntaxError(`Unexpected token ${tokens[2].image}`);
  }
  const subjectRef = parseSubjectToken(tokens[3]);
  return {
    action: Action.RemovePermissionOverrideOn,
    channel: channelRef,
    subject: subjectRef,
  };
}
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
