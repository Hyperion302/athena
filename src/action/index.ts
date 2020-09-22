import { tAction } from './actions';

// Maximum values
export const MAX_ROLE_LENGTH = 64;
export const MIN_ROLE_LENGTH = 0;
export const MAX_CHANNEL_LENGTH = 100;
export const MIN_CHANNEL_LENGTH = 2;
export const MAX_SERVER_LENGTH = 100;
export const MIN_SERVER_LENGTH = 2;
export const MIN_TOPIC_LENGTH = 0;
export const MAX_TOPIC_LENGTH = 1024;
export const MIN_COLOR = 0;
export const MAX_COLOR = 16777215;

export const MAX_ACTION_LENGTH = 2048;

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
  SetCategory = 'set category',
  SyncToCategory = 'sync to category',
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
  Category = 'category',
}

export enum ReferenceType {
  Pointer,
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
  type: ReferenceType.Pointer;
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
export { renderDurationString, renderAction } from './renderer';
export { executeActions } from './executor';
export {
  ReferenceValidationResult,
  ReferenceValidationError,
  ActionValidationResult,
  ActionValidationError,
  ProposalValidationResult,
  validateActions,
  validateAction,
} from './validator';
export { tAction } from './actions';
