import { IToken } from 'chevrotain';
import { Channel, Guild, Role } from 'discord.js';
import { Action } from '..';
import { ResourceList } from '../executor';
import { ActionValidationResult } from '../validator';
import {
  AddPermissionOverrideAction,
  addPermissionOverrideToken,
  executeAddPermissionOverrideAction,
  parseAddPermissionOverrideAction,
  validateAddPermissionOverrideAction,
} from './addPermissionOverride';
import {
  BanAction,
  banToken,
  executeBanAction,
  parseBanAction,
  validateBanAction,
} from './ban';
import {
  ChangeChannelSettingAction,
  changeChannelSettingToken,
  executeChangeChannelSettingAction,
  parseChangeChannelSettingAction,
  validateChangeChannelSettingAction,
} from './changeChannelSetting';
import {
  ChangePermissionOverrideAction,
  changePermissionOverrideToken,
  parseChangePermissionOverrideAction,
  validateChangePermissionOverrideAction,
  executeChangePermissionOverrideAction,
} from './changePermissionOverride';
import {
  ChangeRoleAssignmentAction,
  changeRoleAssignmentToken,
  executeChangeRoleAssignmentAction,
  grantRoleToken,
  parseChangeRoleAssignmentAction,
  revokeRoleToken,
  validateChangeRoleAssignmentAction,
} from './changeRoleAssignment';
import {
  allowPermissionsToken,
  ChangeRolePermissionsAction,
  changeRolePermissionsToken,
  executeChangeRolePermissionsAction,
  parseChangeRolePermissionsAction,
  prohibitPermissionsToken,
  validateChangeRolePermissionsAction,
} from './changeRolePermissions';
import {
  ChangeRoleSettingAction,
  changeRoleSettingToken,
  executeChangeRoleSettingAction,
  parseChangeRoleSettingAction,
  validateChangeRoleSettingAction,
} from './changeRoleSetting';
import {
  ChangeServerSettingAction,
  changeServerSettingToken,
  executeChangeServerSettingAction,
  parseChangeServerSettingAction,
  validateChangeServerSettingAction,
} from './changeServerSetting';
import {
  CreateChannelAction,
  createChannelToken,
  executeCreateChannelAction,
  parseCreateChannelAction,
  validateCreateChannelAction,
} from './createChannel';
import {
  CreateRoleAction,
  createRoleToken,
  executeCreateRoleAction,
  parseCreateRoleAction,
  validateCreateRoleAction,
} from './createRole';
import { DestroyChannelAction, destroyChannelToken } from './destroyChannel';
import {
  DestroyRoleAction,
  destroyRoleToken,
  executeDestroyRoleAction,
  parseDestroyRoleAction,
  validateDestroyRoleAction,
} from './destroyRole';
import {
  executeKickAction,
  KickAction,
  kickToken,
  parseKickAction,
  validateKickAction,
} from './kick';
import {
  executeMoveChannelAction,
  MoveChannelAction,
  moveChannelToken,
  parseMoveChannelAction,
  validateMoveChannelAction,
} from './moveChannel';
import {
  executeMoveRoleAction,
  MoveRoleAction,
  moveRoleToken,
  parseMoveRoleAction,
  validateMoveRoleAction,
} from './moveRole';
import {
  executeRemovePermissionOverrideAction,
  parseRemovePermissionOverrideAction,
  RemovePermissionOverrideAction,
  removePermissionOverrideToken,
  validateRemovePermissionOverrideAction,
} from './removePermissionOverride';
import {
  executeSetCategoryAction,
  parseSetCategoryAction,
  SetCategoryAction,
  setCategoryToken,
  validateSetCategoryAction,
} from './setCategory';
import {
  executeSyncToCategoryAction,
  parseSyncToCategoryAction,
  SyncToCategoryAction,
  syncToCategoryToken,
  validateSyncToCategoryAction,
} from './syncToCategory';

// Convenience union type
export type tAction =
  | KickAction
  | BanAction
  | CreateRoleAction
  | DestroyRoleAction
  | ChangeRoleAssignmentAction
  | ChangeRolePermissionsAction
  | ChangePermissionOverrideAction
  | AddPermissionOverrideAction
  | RemovePermissionOverrideAction
  | ChangeRoleSettingAction
  | MoveRoleAction
  | MoveChannelAction
  | CreateChannelAction
  | DestroyChannelAction
  | ChangeServerSettingAction
  | ChangeChannelSettingAction
  | SetCategoryAction
  | SyncToCategoryAction;
export const actionTokens = [
  kickToken,
  banToken,
  createRoleToken,
  destroyRoleToken,
  changeRoleAssignmentToken,
  grantRoleToken,
  revokeRoleToken,
  moveChannelToken,
  moveRoleToken,
  allowPermissionsToken,
  prohibitPermissionsToken,
  addPermissionOverrideToken,
  changePermissionOverrideToken,
  removePermissionOverrideToken,
  changeRoleSettingToken,
  destroyChannelToken,
  createChannelToken,
  changeServerSettingToken,
  changeChannelSettingToken,
  changeRolePermissionsToken,
  setCategoryToken,
  syncToCategoryToken,
];
export const parsers: {
  [key: string]: (tokens: IToken[]) => tAction;
} = {
  [Action.Kick]: parseKickAction,
  [Action.Ban]: parseBanAction,
  [Action.CreateRole]: parseCreateRoleAction,
  [Action.DestroyChannel]: parseDestroyRoleAction,
  [Action.ChangeRoleAssignment]: parseChangeRoleAssignmentAction,
  [Action.ChangeRolePermissions]: parseChangeRolePermissionsAction,
  [Action.ChangePermissionOverrideOn]: parseChangePermissionOverrideAction,
  [Action.AddPermissionOverrideOn]: parseAddPermissionOverrideAction,
  [Action.RemovePermissionOverrideOn]: parseRemovePermissionOverrideAction,
  [Action.ChangeRoleSetting]: parseChangeRoleSettingAction,
  [Action.MoveRole]: parseMoveRoleAction,
  [Action.MoveChannel]: parseMoveChannelAction,
  [Action.CreateChannel]: parseCreateChannelAction,
  [Action.DestroyChannel]: parseDestroyRoleAction,
  [Action.ChangeServerSetting]: parseChangeServerSettingAction,
  [Action.ChangeChannelSetting]: parseChangeChannelSettingAction,
  [Action.SetCategory]: parseSetCategoryAction,
  [Action.SyncToCategory]: parseSyncToCategoryAction,
};

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
  [Action.AddPermissionOverrideOn]: validateAddPermissionOverrideAction,
  [Action.RemovePermissionOverrideOn]: validateRemovePermissionOverrideAction,
  [Action.ChangeRoleSetting]: validateChangeRoleSettingAction,
  [Action.MoveRole]: validateMoveRoleAction,
  [Action.MoveChannel]: validateMoveChannelAction,
  [Action.CreateChannel]: validateCreateChannelAction,
  [Action.DestroyChannel]: validateDestroyRoleAction,
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
  [Action.DestroyChannel]: executeDestroyRoleAction,
  [Action.ChangeRoleAssignment]: executeChangeRoleAssignmentAction,
  [Action.ChangeRolePermissions]: executeChangeRolePermissionsAction,
  [Action.ChangePermissionOverrideOn]: executeChangePermissionOverrideAction,
  [Action.AddPermissionOverrideOn]: executeAddPermissionOverrideAction,
  [Action.RemovePermissionOverrideOn]: executeRemovePermissionOverrideAction,
  [Action.ChangeRoleSetting]: executeChangeRoleSettingAction,
  [Action.MoveRole]: executeMoveRoleAction,
  [Action.MoveChannel]: executeMoveChannelAction,
  [Action.CreateChannel]: executeCreateChannelAction,
  [Action.DestroyChannel]: executeDestroyRoleAction,
  [Action.ChangeServerSetting]: executeChangeServerSettingAction,
  [Action.ChangeChannelSetting]: executeChangeChannelSettingAction,
  [Action.SetCategory]: executeSetCategoryAction,
  [Action.SyncToCategory]: executeSyncToCategoryAction,
};
