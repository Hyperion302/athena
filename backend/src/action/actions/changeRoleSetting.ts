import { Guild } from 'discord.js';
import { ChangeRoleSettingAction, RoleSetting } from "athena-common";
import { resolveRoleReference, ResourceList } from '@/action/executor';
import { ActionValidationResult, validateRoleReference } from '@/action/validator';

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
