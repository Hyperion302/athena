import * as chevrotain from 'chevrotain';
import { Action } from '.';
import { actionTokens } from './actions';

const createToken = chevrotain.createToken;

export const PlainText = createToken({
  name: 'PlainText',
  pattern: /[a-zA-Z0-9]\w*/,
});

// Keywords

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
  ...actionTokens,
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
