import * as chevrotain from 'chevrotain';
import { Action } from '.';

const createToken = chevrotain.createToken;

const PlainText = createToken({
  name: 'PlainText',
  pattern: /[a-zA-Z0-9]\w*/,
});

// Keywords

// Action types

const Kick = createToken({
  name: Action.Kick,
  pattern: new RegExp(Action.Kick),
  longer_alt: PlainText,
});

const Ban = createToken({
  name: Action.Ban,
  pattern: new RegExp(Action.Ban),
  longer_alt: PlainText,
});

const CreateRole = createToken({
  name: Action.CreateRole,
  pattern: new RegExp(Action.CreateRole),
  longer_alt: PlainText,
});

const DestroyRole = createToken({
  name: Action.DestroyRole,
  pattern: new RegExp(Action.DestroyRole),
  longer_alt: PlainText,
});

const ChangeRoleAssignment = createToken({
  name: Action.ChangeRoleAssignment,
  pattern: new RegExp(Action.ChangeRoleAssignment),
  longer_alt: PlainText,
});

const GrantRole = createToken({
  name: Action.GrantRole,
  pattern: new RegExp(Action.GrantRole),
  longer_alt: PlainText,
});

const RevokeRole = createToken({
  name: Action.RevokeRole,
  pattern: new RegExp(Action.RevokeRole),
  longer_alt: PlainText,
});

const ChangeRolePermissions = createToken({
  name: Action.ChangeRolePermissions,
  pattern: new RegExp(Action.ChangeRolePermissions),
  longer_alt: PlainText,
});

const AllowPermissions = createToken({
  name: Action.AllowPermissions,
  pattern: new RegExp(Action.AllowPermissions),
  longer_alt: PlainText,
});

const ProhibitPermissions = createToken({
  name: Action.DenyPermissions,
  pattern: new RegExp(Action.DenyPermissions),
  longer_alt: PlainText,
});

const AddPermissionOverrideOn = createToken({
  name: Action.AddPermissionOverrideOn,
  pattern: new RegExp(Action.AddPermissionOverrideOn),
  longer_alt: PlainText,
});

const ChangePermissionOverrideOn = createToken({
  name: Action.ChangePermissionOverrideOn,
  pattern: new RegExp(Action.ChangePermissionOverrideOn),
  longer_alt: PlainText,
});

const RemovePermissionOverrideOn = createToken({
  name: Action.RemovePermissionOverrideOn,
  pattern: new RegExp(Action.RemovePermissionOverrideOn),
  longer_alt: PlainText,
});

const ChangeRoleSetting = createToken({
  name: Action.ChangeRoleSetting,
  pattern: new RegExp(Action.ChangeRoleSetting),
  longer_alt: PlainText,
});

const DestroyChannel = createToken({
  name: Action.DestroyChannel,
  pattern: new RegExp(Action.DestroyChannel),
  longer_alt: PlainText,
});

const ChangeServerSetting = createToken({
  name: Action.ChangeServerSetting,
  pattern: new RegExp(Action.ChangeServerSetting),
  longer_alt: PlainText,
});

const ChangeChannelSetting = createToken({
  name: Action.ChangeChannelSetting,
  pattern: new RegExp(Action.ChangeChannelSetting),
  longer_alt: PlainText,
});
const CreateChannel = createToken({
  name: Action.CreateChannel,
  pattern: new RegExp(Action.CreateChannel),
  longer_alt: PlainText,
});
const MoveChannel = createToken({
  name: Action.MoveChannel,
  pattern: new RegExp(Action.MoveChannel),
  longer_alt: PlainText,
});
const MoveRole = createToken({
  name: Action.MoveRole,
  pattern: new RegExp(Action.MoveRole),
  longer_alt: PlainText,
});
const SetCategory = createToken({
  name: Action.SetCategory,
  pattern: new RegExp(Action.SetCategory),
  longer_alt: PlainText,
});
const SyncToCategory = createToken({
  name: Action.SyncToCategory,
  pattern: new RegExp(Action.SyncToCategory),
  longer_alt: PlainText,
});

// Permissions

const Administrator = createToken({
  name: 'Administrator',
  pattern: /Administrator/,
  longer_alt: PlainText,
});
const CreateInvite = createToken({
  name: 'CreateInvite',
  pattern: /Create Invite/,
  longer_alt: PlainText,
});
const ManageChannels = createToken({
  name: 'ManageChannels',
  pattern: /Manage Channels/,
  longer_alt: PlainText,
});
const ManageServer = createToken({
  name: 'ManageServer',
  pattern: /Manage Server/,
  longer_alt: PlainText,
});
const AddReactions = createToken({
  name: 'AddReactions',
  pattern: /Add Reactions/,
  longer_alt: PlainText,
});
const ViewAuditLog = createToken({
  name: 'ViewAuditLog',
  pattern: /View Audit Log/,
  longer_alt: PlainText,
});
const PrioritySpeaker = createToken({
  name: 'PrioritySpeaker',
  pattern: /Priority Speaker/,
  longer_alt: PlainText,
});
const Stream = createToken({
  name: 'Stream',
  pattern: /Stream/,
  longer_alt: PlainText,
});
const ViewChannel = createToken({
  name: 'ViewChannel',
  pattern: /View Channel/,
  longer_alt: PlainText,
});
const SendMessages = createToken({
  name: 'SendMessages',
  pattern: /Send Messages/,
  longer_alt: PlainText,
});
const SendTTSMessages = createToken({
  name: 'SendTTSMessages',
  pattern: /Send TTS Messages/,
  longer_alt: PlainText,
});
const ManageMessages = createToken({
  name: 'ManageMessages',
  pattern: /Manage Messages/,
  longer_alt: PlainText,
});
const EmbedLinks = createToken({
  name: 'EmbedLinks',
  pattern: /Embed Links/,
  longer_alt: PlainText,
});
const AttachFiles = createToken({
  name: 'AttachFiles',
  pattern: /Attach Files/,
  longer_alt: PlainText,
});
const ReadMessageHistory = createToken({
  name: 'ReadMessageHistory',
  pattern: /Read Message History/,
  longer_alt: PlainText,
});
const MentionEveryone = createToken({
  name: 'MentionEveryone',
  pattern: /Mention Everyone/,
  longer_alt: PlainText,
});
const ExternalEmojis = createToken({
  name: 'ExternalEmojis',
  pattern: /External Emojis/,
  longer_alt: PlainText,
});
const ViewGuildInsights = createToken({
  name: 'ViewGuildInsights',
  pattern: /View Guild Insights/,
  longer_alt: PlainText,
});
const Connect = createToken({
  name: 'Connect',
  pattern: /Connect/,
  longer_alt: PlainText,
});
const Speak = createToken({
  name: 'Speak',
  pattern: /Speak/,
  longer_alt: PlainText,
});
const MuteMembers = createToken({
  name: 'MuteMembers',
  pattern: /Mute/,
  longer_alt: PlainText,
});
const DeafenMembers = createToken({
  name: 'DeafenMembers',
  pattern: /Deafen/,
  longer_alt: PlainText,
});
const MoveMembers = createToken({
  name: 'MoveMembers',
  pattern: /Move/,
  longer_alt: PlainText,
});
const UseVAD = createToken({
  name: 'UseVAD',
  pattern: /VAD/,
  longer_alt: PlainText,
});
const ChangeNickname = createToken({
  name: 'ChangeNickname',
  pattern: /Change Nickname/,
  longer_alt: PlainText,
});
const ManageNicknames = createToken({
  name: 'ManageNicknames',
  pattern: /Manage Nicknames/,
  longer_alt: PlainText,
});
const ManageRoles = createToken({
  name: 'ManageRoles',
  pattern: /Manage Roles/,
  longer_alt: PlainText,
});
const ManageWebhooks = createToken({
  name: 'ManageWebhooks',
  pattern: /Manage Webhooks/,
  longer_alt: PlainText,
});
const ManageEmojis = createToken({
  name: 'ManageEmojis',
  pattern: /Manage Emojis/,
  longer_alt: PlainText,
});

// Settings

const Color = createToken({
  name: 'Color',
  pattern: /color/,
  longer_alt: PlainText,
});
const Hoist = createToken({
  name: 'Hoist',
  pattern: /hoist/,
  longer_alt: PlainText,
});
const Mentionable = createToken({
  name: 'Mentionable',
  pattern: /mentionable/,
  longer_alt: PlainText,
});
const Name = createToken({
  name: 'Name',
  pattern: /name/,
  longer_alt: PlainText,
});
const AFKChannel = createToken({
  name: 'AFKChannel',
  pattern: /afk channel/,
  longer_alt: PlainText,
});
const AFKTimeout = createToken({
  name: 'AFKTimeout',
  pattern: /afk timeout/,
  longer_alt: PlainText,
});
const ContentFilter = createToken({
  name: 'ContentFilter',
  pattern: /content filter/,
  longer_alt: PlainText,
});
const Topic = createToken({
  name: 'Topic',
  pattern: /topic/,
  longer_alt: PlainText,
});

// Other

const Above = createToken({
  name: 'Above',
  pattern: /above/,
  longer_alt: PlainText,
});
const Below = createToken({
  name: 'Below',
  pattern: /below/,
  longer_alt: PlainText,
});
const Text = createToken({
  name: 'Text',
  pattern: /text/,
  longer_alt: PlainText,
});
const Voice = createToken({
  name: 'Voice',
  pattern: /voice/,
  longer_alt: PlainText,
});
const Category = createToken({
  name: 'Category',
  pattern: /category/,
  longer_alt: PlainText,
});
const For = createToken({
  name: 'For',
  pattern: /for/,
  longer_alt: PlainText,
});

const Cross = createToken({ name: 'Cross', pattern: /\+/ });
const Dash = createToken({ name: 'Dash', pattern: /-/ });
const Approx = createToken({ name: 'Approx', pattern: /~/ });

const ExactUsername = createToken({
  name: 'ExactUsername',
  pattern: /".+#\d+"/,
});
const ExactName = createToken({ name: 'ExactName', pattern: /"[^"]+"/ });
const ID = createToken({ name: 'ID', pattern: /i\d+/ });
const RoleMention = createToken({ name: 'RoleMention', pattern: /<@&\d+>/ });
const UserMention = createToken({ name: 'UserMention', pattern: /<@!?\d+>/ });
const ChannelMention = createToken({
  name: 'ChannelMention',
  pattern: /<#\d+>/,
});
const OutputReference = createToken({
  name: 'OutputReference',
  pattern: /\*\d+/,
});

const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /\s+/,
  group: chevrotain.Lexer.SKIPPED,
});

const allTokens = [
  WhiteSpace,
  // Keywords
  Kick,
  Ban,
  CreateRole,
  DestroyRole,
  ChangeRoleAssignment,
  GrantRole,
  RevokeRole,
  MoveChannel,
  MoveRole,
  AllowPermissions,
  ProhibitPermissions,
  AddPermissionOverrideOn,
  ChangePermissionOverrideOn,
  RemovePermissionOverrideOn,
  ChangeRoleSetting,
  DestroyChannel,
  CreateChannel,
  ChangeServerSetting,
  ChangeChannelSetting,
  ChangeRolePermissions,
  SetCategory,
  SyncToCategory,
  Administrator,
  CreateInvite,
  ManageChannels,
  ManageServer,
  AddReactions,
  ViewAuditLog,
  PrioritySpeaker,
  Stream,
  ViewChannel,
  SendMessages,
  SendTTSMessages,
  ManageMessages,
  EmbedLinks,
  AttachFiles,
  ReadMessageHistory,
  MentionEveryone,
  ExternalEmojis,
  ViewGuildInsights,
  Connect,
  Speak,
  MuteMembers,
  DeafenMembers,
  MoveMembers,
  UseVAD,
  ChangeNickname,
  ManageNicknames,
  ManageRoles,
  ManageWebhooks,
  ManageEmojis,
  Color,
  Hoist,
  Mentionable,
  Name,
  AFKChannel,
  AFKTimeout,
  ContentFilter,
  Topic,
  Above,
  Below,
  Text,
  Voice,
  Category,
  For,
  // Identifiers
  Cross,
  Dash,
  Approx,
  ExactUsername,
  ExactName,
  ID,
  RoleMention,
  UserMention,
  ChannelMention,
  OutputReference,
  PlainText,
];

export const ActionLexer = new chevrotain.Lexer(allTokens);
