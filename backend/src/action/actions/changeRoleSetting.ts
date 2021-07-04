import { Guild } from 'discord.js';
import { ChangeRoleSettingAction, ReferenceType, ResolvedChangeRoleSettingAction, RoleSetting } from "athena-common";
import { decacheRoleReference, ResourceList } from '@/action/executor';
import { ActionValidationResult, validateRoleReference } from '@/action/validator';
import { nameToRef, ResolutionList, resolveRoleReference } from '@/action/resolver';

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
export async function resolveChangeRoleSettingAction(
  guild: Guild,
  action: ChangeRoleSettingAction,
  resList: ResolutionList
): Promise<ResolvedChangeRoleSettingAction> {
  return {
    ...action,
    role: nameToRef(await resolveRoleReference(guild, resList, action.role))
  }
}
export async function executeChangeRoleSettingAction(
  guild: Guild,
  action: ChangeRoleSettingAction,
  resourceList: ResourceList
) {
  const role = await decacheRoleReference(guild, resourceList, action.role);
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
