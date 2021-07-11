// Proposal
export const PROPOSAL_NAME_MIN = 1;
export const PROPOSAL_NAME_MAX = 256;
export const PROPOSAL_DESCRIPTION_MIN = 0;
export const PROPOSAL_DESCRIPTION_MAX = 1024;
export const PROPOSAL_DURATION_MIN = 0;
export const PROPOSAL_DURATION_MAX = 60 * 60 * 24 * 2; // 2 Days
export const PROPOSAL_MIN_ACTIONS = 0;
export const PROPOSAL_MAX_ACTIONS = 100;
// Action
export const ACTION_MIN_USERS = 0;
export const ACTION_MAX_USERS = 50;
// Server
export const SERVER_NAME_MAX = 100;
export const SERVER_NAME_MIN = 2;
// Channel
export const CHANNEL_NAME_MAX = 100;
export const CHANNEL_NAME_MIN = 1;
export const CHANNEL_TOPIC_MAX = 1024;
export const CHANNEL_TOPIC_MIN = 0;
export const RATE_LIMIT_MIN = 0;
export const RATE_LIMIT_MAX = 21600;
export const CHILDREN_COUNT_MAX = 50;
export const CHILDREN_COUNT_MIN = 0;
// Role
export const ROLE_NAME_MIN = 1; // Custom
export const ROLE_NAME_MAX = 32; // Custom
// Enums
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

export enum Vote {
  Yes,
  No,
  /**
   * For use in quorum requirements
   */
  Abstain,
}

export const permissions = [
  {
    id: 1 << 0,
    display: "Create Invite",
    djs: "CREATE_INSTANT_INVITE"
  },
  {
    id: 1 << 1,
    display: "Kick",
    djs: "KICK_MEMBERS"
  },
  {
    id: 1 << 2,
    display: "Ban",
    djs: "BAN_MEMBERS"
  },
  {
    id: 1 << 3,
    display: "Administrator",
    djs: "ADMINISTRATOR",
  },
  {
    id: 1 << 4,
    display: "Manage Channels",
    djs: "MANAGE_CHANNELS"
  },
  {
    id: 1 << 5,
    display: "Manage Server",
    djs: "MANAGE_GUILD"
  },
  {
    id: 1 << 6,
    display: "Add Reactions",
    djs: "ADD_REACTIONS"
  },
  {
    id: 1 << 7,
    display: "View Audit Log",
    djs: "VIEW_AUDIT_LOG"
  },
  {
    id: 1 << 8,
    display: "Priority Speaker",
    djs: "PRIORITY_SPEAKER"
  },
  {
    id: 1 << 9,
    display: "Stream",
    djs: "STREAM"
  },
  {
    id: 1 << 10,
    display: "View Channel",
    djs: "VIEW_CHANNEL"
  },
  {
    id: 1 << 11,
    display: "Send Messages",
    djs: "SEND_MESSAGES"
  },
  {
    id: 1 << 12,
    display: "Send TTS Messages",
    djs: "SEND_TTS_MESSAGES"
  },
  {
    id: 1 << 13,
    display: "Manage Messages",
    djs: "MANAGE_MESSAGES"
  },
  {
    id: 1 << 14,
    display: "Embed Links",
    djs: "EMBED_LINKS"
  },
  {
    id: 1 << 15,
    display: "Attach Files",
    djs: "ATTACH_FILES"
  },
  {
    id: 1 << 16,
    display: "Read Message History",
    djs: "READ_MESSAGE_HISTORY"
  },
  {
    id: 1 << 17,
    display: "Mention @everyone",
    djs: "MENTION_EVERYONE"
  },
  {
    id: 1 << 18,
    display: "Use External Emoji",
    djs: "USE_EXTERNAL_EMOJIS"
  },
  {
    id: 1 << 19,
    display: "View Insights",
    djs: "VIEW_GUILD_INSIGHTS"
  },
  {
    id: 1 << 20,
    display: "Connect to VC",
    djs: "CONNECT"
  },
  {
    id: 1 << 21,
    display: "Speak",
    djs: "SPEAK"
  },
  {
    id: 1 << 22,
    display: "Mute Members",
    djs: "MUTE_MEMBERS"
  },
  {
    id: 1 << 23,
    display: "Deafen Members",
    djs: "DEAFEN_MEMBERS"
  },
  {
    id: 1 << 24,
    display: "Move Members",
    djs: "MOVE_MEMBERS"
  },
  {
    id: 1 << 25,
    display: "Use Voice Activity",
    djs: "USE_VAD"
  },
  {
    id: 1 << 26,
    display: "Change Nickname",
    djs: "CHANGE_NICKNAME"
  },
  {
    id: 1 << 27,
    display: "Manage Nicknames",
    djs: "MANAGE_NICKNAMES"
  },
  {
    id: 1 << 28,
    display: "Manage Roles",
    djs: "MANAGE_ROLES"
  },
  {
    id: 1 << 29,
    display: "Manage Webhooks",
    djs: "MANAGE_WEBHOOKS"
  },
  {
    id: 1 << 30,
    display: "Manage Emoji",
    djs: "MANAGE_EMOJIS"
  },
  {
    id: 1 << 31,
    display: "Use Slash Commands",
    djs: "USE_SLASH_COMMANDS"
  },
  {
    id: 1 << 32,
    display: "Request to Speak in Stage",
    djs: "REQUEST_TO_SPEAK"
  },
  {
    id: 1 << 33,
    display: "Manage Threads",
    djs: "MANAGE_THREADS"
  },
  {
    id: 1 << 34,
    display: "Use Public Threads",
    djs: "USE_PUBLIC_THREADS"
  },
  {
    id: 1 << 35,
    display: "Use Private Threads",
    djs: "USE_PRIVATE_THREADS"
  },
];
