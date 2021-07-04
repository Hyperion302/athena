import { Channel, Guild, Role } from 'discord.js';
import { Action, tAction } from "athena-common";
import { ResourceList } from '@/action/executor';
import { ActionValidationResult } from '@/action/validator';
import {
  executeBanAction,
  validateBanAction,
} from './ban';
import {
  executeChangeChannelSettingAction,
  validateChangeChannelSettingAction,
} from './changeChannelSetting';
import {
  validateChangePermissionOverrideAction,
  executeChangePermissionOverrideAction,
} from './changePermissionOverride';
import {
  executeChangeRoleAssignmentAction,
  validateChangeRoleAssignmentAction,
} from './changeRoleAssignment';
import {
  executeChangeRolePermissionsAction,
  validateChangeRolePermissionsAction,
} from './changeRolePermissions';
import {
  executeChangeRoleSettingAction,
  validateChangeRoleSettingAction,
} from './changeRoleSetting';
import {
  executeChangeServerSettingAction,
  validateChangeServerSettingAction,
} from './changeServerSetting';
import {
  executeCreateChannelAction,
  validateCreateChannelAction,
} from './createChannel';
import {
  executeCreateRoleAction,
  validateCreateRoleAction,
} from './createRole';
import { 
  executeDestroyChannelAction,
  validateDestroyChannelAction,
} from './destroyChannel';
import {
  executeDestroyRoleAction,
  validateDestroyRoleAction,
} from './destroyRole';
import {
  executeKickAction,
  validateKickAction,
} from './kick';
import {
  executeMoveChannelAction,
  validateMoveChannelAction,
} from './moveChannel';
import {
  executeMoveRoleAction,
  validateMoveRoleAction,
} from './moveRole';
import {
  executeSetCategoryAction,
  validateSetCategoryAction,
} from './setCategory';
import {
  executeSyncToCategoryAction,
  validateSyncToCategoryAction,
} from './syncToCategory';

export const validators: {
  [key: string]: (
    guild: Guild,
    action: tAction
  ) => Promise<ActionValidationResult>;
} = {
  [Action.Kick]: validateKickAction,
  [Action.Ban]: validateBanAction,
  [Action.CreateRole]: validateCreateRoleAction,
  [Action.DestroyChannel]: validateDestroyRoleAction,
  [Action.ChangeRoleAssignment]: validateChangeRoleAssignmentAction,
  [Action.ChangeRolePermissions]: validateChangeRolePermissionsAction,
  [Action.ChangePermissionOverrideOn]: validateChangePermissionOverrideAction,
  [Action.ChangeRoleSetting]: validateChangeRoleSettingAction,
  [Action.MoveRole]: validateMoveRoleAction,
  [Action.MoveChannel]: validateMoveChannelAction,
  [Action.CreateChannel]: validateCreateChannelAction,
  [Action.DestroyChannel]: validateDestroyChannelAction,
  [Action.ChangeServerSetting]: validateChangeServerSettingAction,
  [Action.ChangeChannelSetting]: validateChangeChannelSettingAction,
  [Action.SetCategory]: validateSetCategoryAction,
  [Action.SyncToCategory]: validateSyncToCategoryAction,
};

// If an executor returns a channel or role, that channel/role is added to the resource
// list as the output for that action.
export const executors: {
  [key: string]: (
    guild: Guild,
    action: tAction,
    resourceList?: ResourceList,
    index?: number
  ) => Promise<void | Channel | Role>;
} = {
  [Action.Kick]: executeKickAction,
  [Action.Ban]: executeBanAction,
  [Action.CreateRole]: executeCreateRoleAction,
  [Action.DestroyRole]: executeDestroyRoleAction,
  [Action.ChangeRoleAssignment]: executeChangeRoleAssignmentAction,
  [Action.ChangeRolePermissions]: executeChangeRolePermissionsAction,
  [Action.ChangePermissionOverrideOn]: executeChangePermissionOverrideAction,
  [Action.ChangeRoleSetting]: executeChangeRoleSettingAction,
  [Action.MoveRole]: executeMoveRoleAction,
  [Action.MoveChannel]: executeMoveChannelAction,
  [Action.CreateChannel]: executeCreateChannelAction,
  [Action.DestroyChannel]: executeDestroyChannelAction,
  [Action.ChangeServerSetting]: executeChangeServerSettingAction,
  [Action.ChangeChannelSetting]: executeChangeChannelSettingAction,
  [Action.SetCategory]: executeSetCategoryAction,
  [Action.SyncToCategory]: executeSyncToCategoryAction,
};
