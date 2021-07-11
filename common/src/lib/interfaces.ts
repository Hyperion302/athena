import * as Constants from "./constants";
import * as Util from "./util";

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



/**
 * @deprecated Use {@link IDResourceReference} instead
 */
export interface UsernameResourceReference {
  type: Constants.ReferenceType.Username;
  username: string;
  discriminator: number;
}

/**
 * @deprecated Use {@link IDResourceReference} instead
 */
export interface FullNameResourceReference {
  type: Constants.ReferenceType.FullName;
  name: string;
}

export interface IDResourceReference {
  type: Constants.ReferenceType.ID;
  id: string;
}

export interface PointerResourceReference {
  type: Constants.ReferenceType.Pointer;
  index: number;
}

export interface ResolvedResourceReference{
  type: Constants.ReferenceType.Resolved;
  name: string;
  original: ResourceReference;
}

export type ResourceReference =
  | IDResourceReference
  | PointerResourceReference
  | ResolvedResourceReference;

/**
 * Add a permission override for a user or role to a channel
 */
export interface AddPermissionOverrideAction {
  action: Constants.Action.AddPermisionOverrideOn;
  channel: ResourceReference;
  subject: ResourceReference;
  allow: number;
  unset: number;
  deny: number;
}
export interface ResolvedAddPermissionOverrideAction {
  action: Constants.Action.AddPermisionOverrideOn;
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
  action: Constants.Action.Ban;
  user: ResourceReference;
}
export interface ResolvedBanAction {
  action: Constants.Action.Ban;
  user: ResolvedResourceReference;
}

/**
 * Change a channel's setting
 */
export interface ChangeChannelSettingAction {
  action: Constants.Action.ChangeChannelSetting;
  channel: ResourceReference;
  setting: Constants.ChannelSetting;
  value: string;
}
export interface ResolvedChangeChannelSettingAction {
  action: Constants.Action.ChangeChannelSetting;
  channel: ResolvedResourceReference;
  setting: Constants.ChannelSetting;
  value: string;
}

/**
 * Change an already existing permission override on a channel
 */
export interface ChangePermissionOverrideAction {
  action: Constants.Action.ChangePermissionOverrideOn;
  channel: ResourceReference;
  subject: ResourceReference;
  allow: number;
  unset: number;
  deny: number;
}
export interface ResolvedChangePermissionOverrideAction {
  action: Constants.Action.ChangePermissionOverrideOn;
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
  action: Constants.Action.ChangeRoleAssignment;
  role: ResourceReference;
  grant: ResourceReference[];
  revoke: ResourceReference[];
}
export interface ResolvedChangeRoleAssignmentAction {
  action: Constants.Action.ChangeRoleAssignment;
  role: ResolvedResourceReference;
  grant: ResolvedResourceReference[];
  revoke: ResolvedResourceReference[];
}

/**
 * Change the permissions of a role
 */
export interface ChangeRolePermissionsAction {
  action: Constants.Action.ChangeRolePermissions;
  role: ResourceReference;
  allow: number;
  deny: number;
}
export interface ResolvedChangeRolePermissionsAction {
  action: Constants.Action.ChangeRolePermissions;
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
  action: Constants.Action.ChangeRoleSetting;
  role: ResourceReference;
  setting: Constants.RoleSetting.Name;
  value: string;
}
interface ResolvedChangeRoleNameAction {
  action: Constants.Action.ChangeRoleSetting;
  role: ResolvedResourceReference;
  setting: Constants.RoleSetting.Name;
  value: string;
}
interface ChangeRoleColorAction {
  action: Constants.Action.ChangeRoleSetting;
  role: ResourceReference;
  setting: Constants.RoleSetting.Color;
  value: number;
}
interface ResolvedChangeRoleColorAction {
  action: Constants.Action.ChangeRoleSetting;
  role: ResolvedResourceReference;
  setting: Constants.RoleSetting.Color;
  value: number;
}
interface ChangeRoleMentionableAction {
  action: Constants.Action.ChangeRoleSetting;
  role: ResourceReference;
  setting: Constants.RoleSetting.Mentionable;
  value: boolean;
}
interface ResolvedChangeRoleMentionableAction {
  action: Constants.Action.ChangeRoleSetting;
  role: ResolvedResourceReference;
  setting: Constants.RoleSetting.Mentionable;
  value: boolean;
}
interface ChangeRoleHoistAction {
  action: Constants.Action.ChangeRoleSetting;
  role: ResourceReference;
  setting: Constants.RoleSetting.Hoist;
  value: boolean;
}
interface ResolvedChangeRoleHoistAction {
  action: Constants.Action.ChangeRoleSetting;
  role: ResolvedResourceReference;
  setting: Constants.RoleSetting.Hoist;
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
  action: Constants.Action.ChangeServerSetting;
  setting: Constants.ServerSetting.AFKChannel;
  value: ResourceReference;
}
interface ResolvedChangeServerAFKChannelAction {
  action: Constants.Action.ChangeServerSetting;
  setting: Constants.ServerSetting.AFKChannel;
  value: ResolvedResourceReference;
}
interface ChangeServerAFKTimeoutAction {
  action: Constants.Action.ChangeServerSetting;
  setting: Constants.ServerSetting.AFKTimeout;
  /**
   * Timeout in seconds.  Will be rounded to values Discord finds acceptable.
   */
  value: number;
}
interface ResolvedChangeServerAFKTimeoutAction {
  action: Constants.Action.ChangeServerSetting;
  setting: Constants.ServerSetting.AFKTimeout;
  /**
   * Timeout in seconds.  Will be rounded to values Discord finds acceptable.
   */
  value: number;
}
interface ChangeServerNameAction {
  action: Constants.Action.ChangeServerSetting;
  setting: Constants.ServerSetting.Name;
  value: string;
}
interface ResolvedChangeServerNameAction {
  action: Constants.Action.ChangeServerSetting;
  setting: Constants.ServerSetting.Name;
  value: string;
}
interface ChangeServerContentFilterAction {
  action: Constants.Action.ChangeServerSetting;
  setting: Constants.ServerSetting.ContentFilter;
  value: boolean;
}
interface ResolvedChangeServerContentFilterAction {
  action: Constants.Action.ChangeServerSetting;
  setting: Constants.ServerSetting.ContentFilter;
  value: boolean;
}

/**
 * Creates a channel
 */
export interface CreateChannelAction {
  action: Constants.Action.CreateChannel;
  name: string;
  type: Constants.ChannelType;
}
export interface ResolvedCreateChannelAction {
  action: Constants.Action.CreateChannel;
  name: string;
  type: Constants.ChannelType;
}

/**
 * Creates a role
 */
export interface CreateRoleAction {
  action: Constants.Action.CreateRole;
  name: string;
}
export interface ResolvedCreateRoleAction {
  action: Constants.Action.CreateRole;
  name: string;
}

/**
 * Destroys a channel
 */
export interface DestroyChannelAction {
  action: Constants.Action.DestroyChannel;
  channel: ResourceReference;
}
export interface ResolvedDestroyChannelAction {
  action: Constants.Action.DestroyChannel;
  channel: ResolvedResourceReference;
}

/**
 * Destroys a role
 */
export interface DestroyRoleAction {
  action: Constants.Action.DestroyRole;
  role: ResourceReference;
}
export interface ResolvedDestroyRoleAction {
  action: Constants.Action.DestroyRole;
  role: ResolvedResourceReference;
}

/**
 * Kicks a user
 */
export interface KickAction {
  action: Constants.Action.Kick;
  user: ResourceReference;
}
export interface ResolvedKickAction {
  action: Constants.Action.Kick;
  user: ResolvedResourceReference;
}

/**
 * Moves a channel above or below a subject channel
 */
export interface MoveChannelAction {
  action: Constants.Action.MoveChannel;
  channel: ResourceReference;
  direction: Constants.MoveRelativePosition;
  subject: ResourceReference;
}
export interface ResolvedMoveChannelAction {
  action: Constants.Action.MoveChannel;
  channel: ResolvedResourceReference;
  direction: Constants.MoveRelativePosition;
  subject: ResolvedResourceReference;
}


/**
 * Moves a role above or below a subject channel
 */
export interface MoveRoleAction {
  action: Constants.Action.MoveRole;
  role: ResourceReference;
  direction: Constants.MoveRelativePosition;
  subject: ResourceReference;
}
export interface ResolvedMoveRoleAction {
  action: Constants.Action.MoveRole;
  role: ResolvedResourceReference;
  direction: Constants.MoveRelativePosition;
  subject: ResolvedResourceReference;
}

/**
 * Removes a permission override from a channel for a subject role or user
 */
export interface RemovePermissionOverrideAction {
  action: Constants.Action.RemovePermissionOverrideOn;
  channel: ResourceReference;
  subject: ResourceReference;
}
export interface ResolvedRemovePermissionOverrideAction {
  action: Constants.Action.RemovePermissionOverrideOn;
  channel: ResolvedResourceReference;
  subject: ResolvedResourceReference;
}

/**
 * Sets the category of a channel
 */
export interface SetCategoryAction {
  action: Constants.Action.SetCategory;
  channel: ResourceReference;
  category: ResourceReference;
}
export interface ResolvedSetCategoryAction {
  action: Constants.Action.SetCategory;
  channel: ResolvedResourceReference;
  category: ResolvedResourceReference;
}

/**
 * Syncs a channel's permissions to it's category
 */
export interface SyncToCategoryAction {
  action: Constants.Action.SyncToCategory;
  channel: ResourceReference;
}
export interface ResolvedSyncToCategoryAction {
  action: Constants.Action.SyncToCategory;
  channel: ResolvedResourceReference;
}

export interface Proposal {
  /**
   * Author ID
   */
  author: IDResourceReference;
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
  status: Constants.ProposalStatus;
  /**
   * Server the proposal applies to
   */
  server: IDResourceReference;
  /**
   * Current vote tally
   */
  votes: Votes;
}

export type ResolvedProposal = Util.Modify<Proposal, {
  author: ResolvedResourceReference;
  server: ResolvedResourceReference;
}>;

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

/**
 * Container to hold votes
 */
export interface Votes {
  [Constants.Vote.Yes]: number;
  [Constants.Vote.No]: number;
  [Constants.Vote.Abstain]: number;
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
  type: Constants.ChannelType;
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


