import { createToken, IToken } from 'chevrotain';
import { Guild } from 'discord.js';
import { ActionSyntaxError } from '../../errors';
import { Action, ResourceReference } from '..';
import {
  permissionToFlag,
  resolveChannelReference,
  resolveUserOrRoleReference,
  ResourceList,
} from '../executor';
import { PlainText } from '../lexer';
import {
  parseChannelToken,
  parseSubjectToken,
  parsePermissionToken,
} from '../parser';
import {
  ActionValidationResult,
  validateChannelReference,
  validateUserOrRoleReference,
} from '../validator';

export interface AddPermissionOverrideAction {
  action: Action.AddPermissionOverrideOn;
  channel: ResourceReference;
  subject: ResourceReference; // Role or user
  allow: number[];
  unset: number[];
  deny: number[];
}
export const addPermissionOverrideToken = createToken({
  name: Action.AddPermissionOverrideOn,
  pattern: new RegExp(Action.AddPermissionOverrideOn),
  longer_alt: PlainText,
});
export function parseAddPermissionOverrideAction(
  tokens: IToken[]
): AddPermissionOverrideAction {
  const channelRef = parseChannelToken(tokens[1]);
  if (tokens[2].tokenType.name != 'For') {
    throw new ActionSyntaxError(`Unexpected token ${tokens[2].image}`);
  }
  const subjectRef = parseSubjectToken(tokens[3]);
  const permissionTokens = tokens.slice(4);
  const allow: number[] = [];
  const unset: number[] = [];
  const deny: number[] = [];
  if (!permissionTokens || !permissionTokens.length) {
    throw new ActionSyntaxError('Must provide permissions');
  }
  if (permissionTokens.length % 2 != 0) {
    throw new ActionSyntaxError('Malformed permission list');
  }
  for (let i = 0; i < permissionTokens.length; i += 2) {
    const permission = parsePermissionToken(permissionTokens[i + 1]);
    const modeName = permissionTokens[i].tokenType.name;
    if (modeName == 'Cross') {
      allow.push(permission);
    }
    if (modeName == 'Approx') {
      unset.push(permission);
    }
    if (modeName == 'Dash') {
      deny.push(permission);
    }
  }
  return {
    action: Action.AddPermissionOverrideOn,
    subject: subjectRef,
    channel: channelRef,
    allow,
    deny,
    unset,
  };
}
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
  action.allow.forEach((permission) => {
    overwrites[permissionToFlag(permission)] = true;
  });
  action.unset.forEach((permission) => {
    overwrites[permissionToFlag(permission)] = null;
  });
  action.deny.forEach((permission) => {
    overwrites[permissionToFlag(permission)] = false;
  });
  await channel.createOverwrite(subject, overwrites);
}
