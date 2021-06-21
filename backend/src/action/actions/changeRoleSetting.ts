import { createToken, IToken } from 'chevrotain';
import { Guild } from 'discord.js';
import { ActionSyntaxError } from '../../errors';
import {
  Action,
  ResourceReference,
  RoleSetting,
  MIN_COLOR,
  MAX_COLOR,
  MIN_ROLE_LENGTH,
  MAX_ROLE_LENGTH,
} from '..';
import { resolveRoleReference, ResourceList } from '../executor';
import { PlainText } from '../lexer';
import { parseRoleToken, parseRoleSettingToken } from '../parser';
import { ActionValidationResult, validateRoleReference } from '../validator';

export type ChangeRoleSettingAction =
  | ChangeRoleNameAction
  | ChangeRoleColorAction
  | ChangeRoleMentionableAction
  | ChangeRoleHoistAction;

interface ChangeRoleNameAction {
  action: Action.ChangeRoleSetting;
  role: ResourceReference;
  setting: RoleSetting.Name;
  value: string;
}

interface ChangeRoleColorAction {
  action: Action.ChangeRoleSetting;
  role: ResourceReference;
  setting: RoleSetting.Color;
  value: number;
}

interface ChangeRoleMentionableAction {
  action: Action.ChangeRoleSetting;
  role: ResourceReference;
  setting: RoleSetting.Mentionable;
  value: boolean;
}

interface ChangeRoleHoistAction {
  action: Action.ChangeRoleSetting;
  role: ResourceReference;
  setting: RoleSetting.Hoist;
  value: boolean;
}
export const changeRoleSettingToken = createToken({
  name: Action.ChangeRoleSetting,
  pattern: new RegExp(Action.ChangeRoleSetting),
  longer_alt: PlainText,
});
export function parseChangeRoleSettingAction(
  tokens: IToken[]
): ChangeRoleSettingAction {
  const roleRef = parseRoleToken(tokens[1]);
  const setting = parseRoleSettingToken(tokens[2]);
  switch (setting) {
    case RoleSetting.Color:
      const colorString = tokens.slice(3)[0].image;
      const colorNum = parseInt(colorString, 10);
      if (!colorNum) {
        throw new ActionSyntaxError(`Invalid color ${colorString}`);
      }
      if (colorNum < MIN_COLOR || colorNum > MAX_COLOR) {
        throw new ActionSyntaxError('Color out of bounds');
      }
      return {
        action: Action.ChangeRoleSetting,
        role: roleRef,
        setting,
        value: colorNum,
      };
    case RoleSetting.Hoist:
    case RoleSetting.Mentionable:
      return {
        action: Action.ChangeRoleSetting,
        role: roleRef,
        setting,
        value: tokens.slice(3)[0].image == 'true',
      };
    case RoleSetting.Name:
      const name = tokens
        .slice(3)
        .map((token) => token.image)
        .join(' ');
      if (name.length < MIN_ROLE_LENGTH || name.length > MAX_ROLE_LENGTH) {
        throw new ActionSyntaxError(
          `Role name too long or too short (${MIN_ROLE_LENGTH}-${MAX_ROLE_LENGTH})`
        );
      }
      return {
        action: Action.ChangeRoleSetting,
        role: roleRef,
        setting,
        value: name,
      };
    default:
      throw new ActionSyntaxError(`Unrecognized role setting ${setting}`);
  }
}
export async function validateChangeRoleSettingAction(
  guild: Guild,
  action: ChangeRoleSettingAction
): Promise<ActionValidationResult> {
  const roleValidation = await validateRoleReference(guild, action.role);
  return {
    valid: roleValidation.valid,
    referenceValidations: [roleValidation],
  };
}
export async function executeChangeRoleSettingAction(
  guild: Guild,
  action: ChangeRoleSettingAction,
  resourceList: ResourceList
) {
  const role = await resolveRoleReference(guild, resourceList, action.role);
  switch (action.setting) {
    case RoleSetting.Color:
      await role.setColor(action.value);
      break;
    case RoleSetting.Hoist:
      await role.setHoist(action.value);
      break;
    case RoleSetting.Mentionable:
      await role.setMentionable(action.value);
      break;
    case RoleSetting.Name:
      await role.setName(action.value);
      break;
  }
}
