import { createToken, IToken } from 'chevrotain';
import { Guild } from 'discord.js';
import { ActionSyntaxError } from '../../errors';
import { Action, ResourceReference } from '..';
import {
  ResourceList,
  resolveChannelReference,
  resolveUserOrRoleReference,
  permissionToFlag,
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

export interface ChangePermissionOverrideAction {
  action: Action.ChangePermissionOverrideOn;
  channel: ResourceReference;
  subject: ResourceReference; // Role or user
  allow: number[];
  unset: number[];
  deny: number[];
}
export const changePermissionOverrideToken = createToken({
  name: Action.ChangePermissionOverrideOn,
  pattern: new RegExp(Action.ChangePermissionOverrideOn),
  longer_alt: PlainText,
});

export function parseChangePermissionOverrideAction(
  tokens: IToken[]
): ChangePermissionOverrideAction {
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
    action: Action.ChangePermissionOverrideOn,
    subject: subjectRef,
    channel: channelRef,
    allow,
    deny,
    unset,
  };
}
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
export async function executeChangePermissionOverrideAction(
  guild: Guild,
  action: ChangePermissionOverrideAction,
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
