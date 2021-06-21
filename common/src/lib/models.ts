export enum Action {
  Kick,
  Ban,
  CreateRole,
  DestroyRole,
  ChangeRoleAssignment,
  GrantRole,
  RevokeRole,
  ChangeRolePermissions,
  AllowPermissions,
  DenyPermissions,
  AddPermisionOverrideOn,
  ChangePermissionOverrideOn,
  RemovePermissionOverrideOn,
  ChangeRoleSetting,
  MoveRole,
  MoveChannel,
  CreateChannel,
  DestroyChannel,
  ChangeServerSetting,
  ChangeChannelSetting,
  SetCategory,
  SyncToCategory,
}

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

export type tResolvedAction =
  | ResolvedKickAction
  | ResolvedBanAction
  | ResolvedCreateRoleAction
  | ResolvedDestroyRoleAction
  | ResolvedChangeRoleAssignmentAction
  | ResolvedChangeRolePermissionsAction
  | ResolvedChangePermissionOverrideAction
  | ResolvedAddPermissionOverrideAction
  | ResolvedRemovePermissionOverrideAction
  | ResolvedChangeRoleSettingAction
  | ResolvedMoveRoleAction
  | ResolvedMoveChannelAction
  | ResolvedCreateChannelAction
  | ResolvedDestroyChannelAction
  | ResolvedChangeServerSettingAction
  | ResolvedChangeChannelSettingAction
  | ResolvedSetCategoryAction
  | ResolvedSyncToCategoryAction;

export enum RoleSetting {
  Color,
  Hoist,
  Mentionable,
  Name,
}

export enum ServerSetting {
  AFKChannel,
  AFKTimeout,
  Name,
  ContentFilter,
}

export enum ChannelSetting {
  Name,
  Topic,
}

export enum MoveRelativePosition {
  Above,
  Below,
}

export enum ChannelType {
  Text,
  Voice,
  Category,
}

export enum ReferenceType {
  Pointer,
  ID,
  Resolved,
  /**
   * @deprecated Use ID instead
   */
  FullName,
  /**
   * @deprecated Use ID instead
   */
  Username,
}

/**
 * @deprecated Use {@link IDResourceReference} instead
 */
export interface UsernameResourceReference {
  type: ReferenceType.Username;
  username: string;
  discriminator: number;
}

/**
 * @deprecated Use {@link IDResourceReference} instead
 */
export interface FullNameResourceReference {
  type: ReferenceType.FullName;
  name: string;
}

export interface IDResourceReference {
  type: ReferenceType.ID;
  id: string;
}

export interface PointerResourceReference {
  type: ReferenceType.Pointer;
  index: number;
}

export interface ResolvedResourceReference {
  type: ReferenceType.Resolved;
  name: string;
}

export type ResourceReference =
  | IDResourceReference
  | PointerResourceReference
  | ResolvedResourceReference;

/**
 * Add a permission override for a user or role to a channel
 */
export interface AddPermissionOverrideAction {
  action: Action.AddPermisionOverrideOn;
  channel: ResourceReference;
  subject: ResourceReference;
  allow: number;
  unset: number;
  deny: number;
}
export interface ResolvedAddPermissionOverrideAction {
  action: Action.AddPermisionOverrideOn;
  channel: ResolvedResourceReference;
  subject: ResolvedResourceReference;
  allow: number;
  unset: number;
  deny: number;
}

/**
 * Ban a user
 */
export interface BanAction {
  action: Action.Ban;
  user: ResourceReference;
}
export interface ResolvedBanAction {
  action: Action.Ban;
  user: ResolvedResourceReference;
}

/**
 * Change a channel's setting
 */
export interface ChangeChannelSettingAction {
  action: Action.ChangeChannelSetting;
  channel: ResourceReference;
  setting: ChannelSetting;
  value: string;
}
export interface ResolvedChangeChannelSettingAction {
  action: Action.ChangeChannelSetting;
  channel: ResolvedResourceReference;
  setting: ChannelSetting;
  value: string;
}

/**
 * Change an already existing permission override on a channel
 */
export interface ChangePermissionOverrideAction {
  action: Action.ChangePermissionOverrideOn;
  channel: ResourceReference;
  subject: ResourceReference;
  allow: number;
  unset: number;
  deny: number;
}
export interface ResolvedChangePermissionOverrideAction {
  action: Action.ChangePermissionOverrideOn;
  channel: ResolvedResourceReference;
  subject: ResolvedResourceReference;
  allow: number;
  unset: number;
  deny: number;
}

/**
 * Change a role's assignment to users
 */
export interface ChangeRoleAssignmentAction {
  action: Action.ChangeRoleAssignment;
  role: ResourceReference;
  grant: ResourceReference[];
  revoke: ResourceReference[];
}
export interface ResolvedChangeRoleAssignmentAction {
  action: Action.ChangeRoleAssignment;
  role: ResolvedResourceReference;
  grant: ResolvedResourceReference[];
  revoke: ResolvedResourceReference[];
}

/**
 * Change the permissions of a role
 */
export interface ChangeRolePermissionsAction {
  action: Action.ChangeRolePermissions;
  role: ResourceReference;
  allow: number;
  deny: number;
}
export interface ResolvedChangeRolePermissionsAction {
  action: Action.ChangeRolePermissions;
  role: ResolvedResourceReference;
  allow: number;
  deny: number;
}

/**
 * Change a setting on a role
 */
export type ChangeRoleSettingAction =
  | ChangeRoleNameAction
  | ChangeRoleColorAction
  | ChangeRoleMentionableAction
  | ChangeRoleHoistAction;
export type ResolvedChangeRoleSettingAction =
  | ResolvedChangeRoleNameAction
  | ResolvedChangeRoleColorAction
  | ResolvedChangeRoleMentionableAction
  | ResolvedChangeRoleHoistAction;
interface ChangeRoleNameAction {
  action: Action.ChangeRoleSetting;
  role: ResourceReference;
  setting: RoleSetting.Name;
  value: string;
}
interface ResolvedChangeRoleNameAction {
  action: Action.ChangeRoleSetting;
  role: ResolvedResourceReference;
  setting: RoleSetting.Name;
  value: string;
}
interface ChangeRoleColorAction {
  action: Action.ChangeRoleSetting;
  role: ResourceReference;
  setting: RoleSetting.Color;
  value: number;
}
interface ResolvedChangeRoleColorAction {
  action: Action.ChangeRoleSetting;
  role: ResolvedResourceReference;
  setting: RoleSetting.Color;
  value: number;
}
interface ChangeRoleMentionableAction {
  action: Action.ChangeRoleSetting;
  role: ResourceReference;
  setting: RoleSetting.Mentionable;
  value: boolean;
}
interface ResolvedChangeRoleMentionableAction {
  action: Action.ChangeRoleSetting;
  role: ResolvedResourceReference;
  setting: RoleSetting.Mentionable;
  value: boolean;
}
interface ChangeRoleHoistAction {
  action: Action.ChangeRoleSetting;
  role: ResourceReference;
  setting: RoleSetting.Hoist;
  value: boolean;
}
interface ResolvedChangeRoleHoistAction {
  action: Action.ChangeRoleSetting;
  role: ResolvedResourceReference;
  setting: RoleSetting.Hoist;
  value: boolean;
}

/**
 * Change a setting on a server
 */
export type ChangeServerSettingAction =
  | ChangeServerAFKChannelAction
  | ChangeServerAFKTimeoutAction
  | ChangeServerNameAction
  | ChangeServerContentFilterAction;
export type ResolvedChangeServerSettingAction =
  | ResolvedChangeServerAFKChannelAction
  | ResolvedChangeServerAFKTimeoutAction
  | ResolvedChangeServerNameAction
  | ResolvedChangeServerContentFilterAction;
interface ChangeServerAFKChannelAction {
  action: Action.ChangeServerSetting;
  setting: ServerSetting.AFKChannel;
  value: ResourceReference;
}
interface ResolvedChangeServerAFKChannelAction {
  action: Action.ChangeServerSetting;
  setting: ServerSetting.AFKChannel;
  value: ResolvedResourceReference;
}
interface ChangeServerAFKTimeoutAction {
  action: Action.ChangeServerSetting;
  setting: ServerSetting.AFKTimeout;
  /**
   * Timeout in seconds.  Will be rounded to values Discord finds acceptable.
   */
  value: number;
}
interface ResolvedChangeServerAFKTimeoutAction {
  action: Action.ChangeServerSetting;
  setting: ServerSetting.AFKTimeout;
  /**
   * Timeout in seconds.  Will be rounded to values Discord finds acceptable.
   */
  value: number;
}
interface ChangeServerNameAction {
  action: Action.ChangeServerSetting;
  setting: ServerSetting.Name;
  value: string;
}
interface ResolvedChangeServerNameAction {
  action: Action.ChangeServerSetting;
  setting: ServerSetting.Name;
  value: string;
}
interface ChangeServerContentFilterAction {
  action: Action.ChangeServerSetting;
  setting: ServerSetting.ContentFilter;
  value: boolean;
}
interface ResolvedChangeServerContentFilterAction {
  action: Action.ChangeServerSetting;
  setting: ServerSetting.ContentFilter;
  value: boolean;
}

/**
 * Creates a channel
 */
export interface CreateChannelAction {
  action: Action.CreateChannel;
  name: string;
  type: ChannelType;
}
export interface ResolvedCreateChannelAction {
  action: Action.CreateChannel;
  name: string;
  type: ChannelType;
}

/**
 * Creates a role
 */
export interface CreateRoleAction {
  action: Action.CreateRole;
  name: string;
}
export interface ResolvedCreateRoleAction {
  action: Action.CreateRole;
  name: string;
}

/**
 * Destroys a channel
 */
export interface DestroyChannelAction {
  action: Action.DestroyChannel;
  channel: ResourceReference;
}
export interface ResolvedDestroyChannelAction {
  action: Action.DestroyChannel;
  channel: ResolvedResourceReference;
}

/**
 * Destroys a role
 */
export interface DestroyRoleAction {
  action: Action.DestroyRole;
  role: ResourceReference;
}
export interface ResolvedDestroyRoleAction {
  action: Action.DestroyRole;
  role: ResolvedResourceReference;
}

/**
 * Kicks a user
 */
export interface KickAction {
  action: Action.Kick;
  user: ResourceReference;
}
export interface ResolvedKickAction {
  action: Action.Kick;
  user: ResolvedResourceReference;
}

/**
 * Moves a channel above or below a subject channel
 */
export interface MoveChannelAction {
  action: Action.MoveChannel;
  channel: ResourceReference;
  direction: MoveRelativePosition;
  subject: ResourceReference;
}
export interface ResolvedMoveChannelAction {
  action: Action.MoveChannel;
  channel: ResolvedResourceReference;
  direction: MoveRelativePosition;
  subject: ResolvedResourceReference;
}


/**
 * Moves a role above or below a subject channel
 */
export interface MoveRoleAction {
  action: Action.MoveRole;
  role: ResourceReference;
  direction: MoveRelativePosition;
  subject: ResourceReference;
}
export interface ResolvedMoveRoleAction {
  action: Action.MoveRole;
  role: ResolvedResourceReference;
  direction: MoveRelativePosition;
  subject: ResolvedResourceReference;
}

/**
 * Removes a permission override from a channel for a subject role or user
 */
export interface RemovePermissionOverrideAction {
  action: Action.RemovePermissionOverrideOn;
  channel: ResourceReference;
  subject: ResourceReference;
}
export interface ResolvedRemovePermissionOverrideAction {
  action: Action.RemovePermissionOverrideOn;
  channel: ResolvedResourceReference;
  subject: ResolvedResourceReference;
}

/**
 * Sets the category of a channel
 */
export interface SetCategoryAction {
  action: Action.SetCategory;
  channel: ResourceReference;
  category: ResourceReference;
}
export interface ResolvedSetCategoryAction {
  action: Action.SetCategory;
  channel: ResolvedResourceReference;
  category: ResolvedResourceReference;
}

/**
 * Syncs a channel's permissions to it's category
 */
export interface SyncToCategoryAction {
  action: Action.SyncToCategory;
  channel: ResourceReference;
}
export interface ResolvedSyncToCategoryAction {
  action: Action.SyncToCategory;
  channel: ResolvedResourceReference;
}


/**
 * Different states a proposal can be in
 */
export enum ProposalStatus {
  /**
   * Proposal still being modified, actions still being added
   */
  Building,
  /**
   * Proposal can be voted on, no more changes
   */
  Running,
  /**
   * Proposal not votable, not editable
   * */
  Cancelled,
  /**
   * Proposal passed and executed successfully
   */
  Passed,
  /**
   * Proposal failed and did not execute
   */
  Failed,
  /**
   * Proposal passed and failed to execute
   */
  ExecutionError,
}

export interface Proposal {
  /**
   * Author ID
   */
  author: string;
  /**
   * ID
   */
  id: string;
  /**
   * Creation datestamp
   */
  createdOn: Date;
  /**
   * Expire datestamp
   */
  expiresOn: Date;
  /**
   * Number of seconds the proposal will last
   */
  duration: number;
  /**
   * Friendly name for the proposal
   */
  name: string;
  /**
   * Friendly description for the proposal
   */
  description: string;
  /**
   * Current status of the proposal
   */
  status: ProposalStatus;
  /**
   * Server the proposal applies to
   */
  server: string;
}

export interface NewProposalRequest {
  /**
   * Number of seconds the proposal will last
   */
  duration: number;
  /**
   * Friendly name for the proposal
   */
  name: string;
  /**
   * Friendly description for the proposal
   */
  description: string;
  /**
   * Server the proposal applies to
   */
  server: string;
  /**
   * Zero or more actions for the new proposal
   */
  actions: tAction[];
}

export enum Vote {
  Yes,
  No,
  /**
   * For use in quorum requirements
   */
  Abstain,
}

/**
 * Container to hold votes
 */
export interface Votes {
  [Vote.Yes]: number;
  [Vote.No]: number;
  [Vote.Abstain]: number;
}

/**
 * Utilities to make handling Discord API responses easier to handle
 */
export interface Server {
  id: string;
  name: string;
  icon: string;
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
}

export interface Role {
  id: string;
  name: string;
  position: number;
  hoist: boolean;
}

export interface User {
  id: string;
  username: string;
  discriminator: string;
  nickname?: string;
  avatar?: string;
}


