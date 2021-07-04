import { Channel, Guild, Role } from 'discord.js';
import { Action, tAction, tResolvedAction } from "athena-common";
import { ResourceList } from '@/action/executor';
import { ActionValidationResult } from '@/action/validator';
import { ResolutionList } from '../resolver';
import {
  executeBanAction,
  validateBanAction,
  resolveBanAction
} from './ban';
import {
  executeChangeChannelSettingAction,
  validateChangeChannelSettingAction,
  resolveChangeChannelSettingAction
} from './changeChannelSetting';
import {
  validateChangePermissionOverrideAction,
  executeChangePermissionOverrideAction,
  resolveChangePermissionOverrideAction
} from './changePermissionOverride';
import {
  executeChangeRoleAssignmentAction,
  validateChangeRoleAssignmentAction,
  resolveChangeRoleAssignmentAction
} from './changeRoleAssignment';
import {
  executeChangeRolePermissionsAction,
  validateChangeRolePermissionsAction,
  resolveChangeRolePermissionsAction
} from './changeRolePermissions';
import {
  executeChangeRoleSettingAction,
  validateChangeRoleSettingAction,
  resolveChangeRoleSettingAction
} from './changeRoleSetting';
import {
  executeChangeServerSettingAction,
  validateChangeServerSettingAction,
  resolveChangeServerSettingAction
} from './changeServerSetting';
import {
  executeCreateChannelAction,
  validateCreateChannelAction,
  resolveCreateChannelAction
} from './createChannel';
import {
  executeCreateRoleAction,
  validateCreateRoleAction,
  resolveCreateRoleAction
} from './createRole';
import { 
  executeDestroyChannelAction,
  validateDestroyChannelAction,
  resolveDestroyChannelAction
} from './destroyChannel';
import {
  executeDestroyRoleAction,
  validateDestroyRoleAction,
  resolveDestroyRoleAction
} from './destroyRole';
import {
  executeKickAction,
  resolveKickAction,
  validateKickAction,
} from './kick';
import {
  executeMoveChannelAction,
  validateMoveChannelAction,
  resolveMoveChannelAction
} from './moveChannel';
import {
  executeMoveRoleAction,
  validateMoveRoleAction,
  resolveMoveRoleAction
} from './moveRole';
import {
  executeSetCategoryAction,
  validateSetCategoryAction,
  resolveSetCategoryAction
} from './setCategory';
import {
  executeSyncToCategoryAction,
  validateSyncToCategoryAction,
  resolveSyncToCategoryAction
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
  [Action.DestroyRole]: validateDestroyRoleAction,
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

export const resolvers: {
  [key: string]: (
    guild: Guild,
    action: tAction,
    resList?: ResolutionList
  ) => Promise<tResolvedAction>;
} = {
  [Action.Kick]: resolveKickAction,
  [Action.Ban]: resolveBanAction,
  [Action.CreateRole]: resolveCreateRoleAction,
  [Action.DestroyRole]: resolveDestroyRoleAction,
  [Action.ChangeRoleAssignment]: resolveChangeRoleAssignmentAction,
  [Action.ChangeRolePermissions]: resolveChangeRolePermissionsAction,
  [Action.ChangePermissionOverrideOn]: resolveChangePermissionOverrideAction,
  [Action.ChangeRoleSetting]: resolveChangeRoleSettingAction,
  [Action.MoveRole]: resolveMoveRoleAction,
  [Action.MoveChannel]: resolveMoveChannelAction,
  [Action.CreateChannel]: resolveCreateChannelAction,
  [Action.DestroyChannel]: resolveDestroyChannelAction,
  [Action.ChangeServerSetting]: resolveChangeServerSettingAction,
  [Action.ChangeChannelSetting]: resolveChangeChannelSettingAction,
  [Action.SetCategory]: resolveSetCategoryAction,
  [Action.SyncToCategory]: resolveSyncToCategoryAction,

}

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
