// Maximum values
export const MAX_ROLE_NAME = 64;
export const MAX_CHANNEL_NAME = 100;
export const MIN_CHANNEL_NAME = 2;

interface ActionList {
  [key: number]: tAction;
}

export const enum Action {
  Kick = 'kick',
  Ban = 'ban',
  CreateRole = 'create role',
  DestroyRole = 'destroy role',
  ChangeRoleAssignment = 'change role assignment',
  GrantRole = 'grant role',
  RevokeRole = 'revoke role',
  ChangeRolePermissions = 'change role permissions',
  AllowPermissions = 'allow permissions',
  DenyPermissions = 'deny permissions',
  AddPermissionOverrideOn = 'add permission override on',
  ChangePermissionOverrideOn = 'change permission override on',
  RemovePermissionOverrideOn = 'remove permission override on',
  ChangeRoleSetting = 'change role setting',
  MoveRole = 'move role',
  MoveChannel = 'move channel',
  CreateChannel = 'create channel',
  DestroyChannel = 'destroy channel',
  ChangeServerSetting = 'change server setting',
  ChangeChannelSetting = 'change channel setting',
}

export enum RoleSetting {
  Color = 'color',
  Hoist = 'hoist',
  Mentionable = 'mentionable',
  Name = 'name',
}

export enum ServerSetting {
  AFKChannel = 'afk channel',
  AFKTimeout = 'afk timeout',
  Name = 'name',
  ContentFilter = 'content filter',
  // TODO: More
}

export enum ChannelSetting {
  Name = 'name',
  Topic = 'topic',
}

export enum MoveRelativePosition {
  Above = 'above',
  Below = 'below',
}

export enum ChannelType {
  Text = 'text',
  Voice = 'voice',
}

interface KickAction {
  action: Action.Kick;
  user: ResourceReference;
}

interface BanAction {
  action: Action.Ban;
  user: ResourceReference;
}

interface CreateRoleAction {
  action: Action.CreateRole;
  name: string;
}

interface DestroyRoleAction {
  action: Action.DestroyRole;
  role: ResourceReference;
}

interface ChangeRoleAssignmentAction {
  action: Action.ChangeRoleAssignment;
  role: ResourceReference;
  grant: ResourceReference[];
  revoke: ResourceReference[];
}

interface ChangeRolePermissionsAction {
  action: Action.ChangeRolePermissions;
  role: ResourceReference;
  allow: number[];
  deny: number[];
}

interface AddPermissionOverrideAction {
  action: Action.AddPermissionOverrideOn;
  channel: ResourceReference;
  subject: ResourceReference; // Role or user
  allow: number[];
  unset: number[];
  deny: number[];
}

interface ChangePermissionOverrideAction {
  action: Action.ChangePermissionOverrideOn;
  channel: ResourceReference;
  subject: ResourceReference; // Role or user
  allow: number[];
  unset: number[];
  deny: number[];
}

interface RemovePermissionOverrideAction {
  action: Action.RemovePermissionOverrideOn;
  channel: ResourceReference;
  subject: ResourceReference; // Role or user
}

type ChangeRoleSettingAction =
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

interface MoveRoleAction {
  action: Action.MoveRole;
  role: ResourceReference;
  direction: MoveRelativePosition;
  subject: ResourceReference;
}

interface MoveChannelAction {
  action: Action.MoveChannel;
  channel: ResourceReference;
  direction: MoveRelativePosition;
  subject: ResourceReference;
}

interface CreateChannelAction {
  action: Action.CreateChannel;
  name: string;
  type: ChannelType;
}

interface DestroyChannelAction {
  action: Action.DestroyChannel;
  channel: ResourceReference;
}

type ChangeServerSettingAction =
  | ChangeServerAFKChannelAction
  | ChangeServerAFKTimeoutAction
  | ChangeServerNameAction
  | ChangeServerContentFilterAction;

interface ChangeServerAFKChannelAction {
  action: Action.ChangeServerSetting;
  setting: ServerSetting.AFKChannel;
  value: ResourceReference;
}

interface ChangeServerAFKTimeoutAction {
  action: Action.ChangeServerSetting;
  setting: ServerSetting.AFKTimeout;
  value: number;
}

interface ChangeServerNameAction {
  action: Action.ChangeServerSetting;
  setting: ServerSetting.Name;
  value: string;
}

interface ChangeServerContentFilterAction {
  action: Action.ChangeServerSetting;
  setting: ServerSetting.ContentFilter;
  value: boolean;
}

interface ChangeChannelSettingAction {
  action: Action.ChangeChannelSetting;
  channel: ResourceReference;
  setting: ChannelSetting;
  value: string;
}

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
  | ChangeChannelSettingAction;

export enum ReferenceType {
  Output,
  ID,
  FullName,
  Username,
}

interface UsernameResourceReference {
  type: ReferenceType.Username;
  username: string;
  discriminator: number;
}

interface IDResourceReference {
  type: ReferenceType.ID;
  id: string;
}

interface OutputResourceReference {
  type: ReferenceType.Output;
  index: number;
}

interface FullNameResourceReference {
  type: ReferenceType.FullName;
  name: string;
}

export type ResourceReference =
  | IDResourceReference
  | OutputResourceReference
  | FullNameResourceReference
  | UsernameResourceReference;

export { ActionLexer } from './lexer';
export { parseAction, parseDuration } from './parser';
export {
  getAction,
  getActions,
  getNextIndex,
  createAction,
  replaceAction,
  removeAction,
  insertAction,
} from './db';
export { getDurationString, actionAsHumanReadable } from './renderer';
export { executeActions } from './executor';
export { validateActions, validateAction } from './validator';
