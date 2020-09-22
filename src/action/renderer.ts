import { Permissions } from 'discord.js';
import {
  ResourceReference,
  ReferenceType,
  tAction,
  Action,
  ServerSetting,
  ChannelType,
} from '.';

export function renderDurationString(duration: number): string {
  if (duration < 60) return `${duration} seconds`;
  if (duration < 60 * 60) return `${Math.floor(duration / 60)} minutes`;
  if (duration < 60 * 60 * 24)
    return `${Math.floor(duration / (60 * 60))} hours`;
  return `${Math.floor(duration / (60 * 60 * 24))} days`;
}

function renderPermission(permission: number): string {
  const pflags = Permissions.FLAGS;
  switch (permission) {
    case pflags.ADMINISTRATOR:
      return 'Administrator';
    case pflags.CREATE_INSTANT_INVITE:
      return 'Create Invite';
    case pflags.MANAGE_CHANNELS:
      return 'Manage Channels';
    case pflags.MANAGE_GUILD:
      return 'Manage Server';
    case pflags.ADD_REACTIONS:
      return 'Add Reactions';
    case pflags.VIEW_AUDIT_LOG:
      return 'View Audit Log';
    case pflags.PRIORITY_SPEAKER:
      return 'Priority Speaker';
    case pflags.STREAM:
      return 'Stream';
    case pflags.VIEW_CHANNEL:
      return 'View Channel';
    case pflags.SEND_MESSAGES:
      return 'Send Messages';
    case pflags.SEND_TTS_MESSAGES:
      return 'Send TTS Messages';
    case pflags.MANAGE_MESSAGES:
      return 'Manage Messages';
    case pflags.EMBED_LINKS:
      return 'Embed Links';
    case pflags.ATTACH_FILES:
      return 'Attach Files';
    case pflags.READ_MESSAGE_HISTORY:
      return 'Read Message History';
    case pflags.MENTION_EVERYONE:
      return 'Mention Everyone';
    case pflags.USE_EXTERNAL_EMOJIS:
      return 'Use External Emoji';
    case pflags.VIEW_GUILD_INSIGHTS:
      return 'View Guild Insights';
    case pflags.CONNECT:
      return 'Connect to Voice';
    case pflags.SPEAK:
      return 'Speak in Voice';
    case pflags.MUTE_MEMBERS:
      return 'Mute Members';
    case pflags.DEAFEN_MEMBERS:
      return 'Deafen Members';
    case pflags.MOVE_MEMBERS:
      return 'Move Members';
    case pflags.USE_VAD:
      return 'VAD';
    case pflags.CHANGE_NICKNAME:
      return 'Change Own Nickname';
    case pflags.MANAGE_NICKNAMES:
      return 'Manage Nicknames';
    case pflags.MANAGE_ROLES:
      return 'Manage Roles';
    case pflags.MANAGE_WEBHOOKS:
      return 'Manage Webhooks';
    case pflags.MANAGE_EMOJIS:
      return 'Manage Emoji';
    default:
      return permission.toString();
  }
}

function renderSubject(ref: ResourceReference): string {
  if (ref.type == ReferenceType.FullName) {
    return ref.name;
  }
  if (ref.type == ReferenceType.Pointer) {
    return `role created in action #${ref.index}`;
  }
  if (ref.type == ReferenceType.ID) {
    return `<@!${ref.id}>/<@&${ref.id}>`;
  }
  return '<error>';
}

export function renderAction(action: tAction): string {
  let readableString = '';
  switch (action.action) {
    case Action.Kick:
      readableString = `Kick ${renderUserReference(action.user)}`;
      break;
    case Action.Ban:
      readableString = `Ban ${renderUserReference(action.user)}`;
      break;
    case Action.CreateRole:
      readableString = `Create a role called ${action.name}`;
      break;
    case Action.DestroyRole:
      readableString = `Destroy ${renderRoleReference}`;
      break;
    case Action.ChangeRoleAssignment:
      // Grant Admin to a, b, c
      // Revoke Admin from a, b, c
      // Grant Admin to a, b, c and revoke it from d, e, f
      const grantString = action.grant.map(renderUserReference).join(', ');
      const revokeString = action.revoke.map(renderUserReference).join(', ');
      const roleAssignmentString = renderRoleReference(action.role);
      if (action.grant.length && !action.revoke.length) {
        readableString = `Grant ${roleAssignmentString} to ${grantString}`;
      }
      if (!action.grant.length && action.revoke.length) {
        readableString = `Revoke ${roleAssignmentString} from ${revokeString}`;
      }
      if (action.grant.length && action.revoke.length) {
        readableString = `Grant ${roleAssignmentString} to ${grantString} and revoke it from ${revokeString}`;
      }
      break;
    case Action.ChangeRolePermissions:
      // Grant a, b, c to Admin
      // Deny a, b, c of Admin
      // Grant a, b, c to Admin and deny it d, e, f
      const allowString = action.allow.map(renderPermission).join(', ');
      const denyString = action.deny.map(renderPermission).join(', ');
      const rolePermissionString = renderRoleReference(action.role);
      if (action.allow.length && !action.deny.length) {
        readableString = `Grant ${allowString} to ${rolePermissionString}`;
      }
      if (!action.allow.length && action.deny.length) {
        readableString = `Deny ${denyString} of ${rolePermissionString}`;
      }
      if (action.allow.length && action.deny.length) {
        readableString = `Grant ${allowString} to ${rolePermissionString} and deny it ${denyString}`;
      }
      break;
    case Action.ChangePermissionOverrideOn:
      // Change permission override on General for Admin to: Allow a, b, c Deny a, b, c Unset a, b, c
      const overrideChannelString = renderChannelReference(action.channel);
      const allowOverrideString = action.allow.map(renderPermission).join(', ');
      const unsetOverrideString = action.unset.map(renderPermission).join(', ');
      const denyOverrideString = action.deny.map(renderPermission).join(', ');
      const combinedOverrideString =
        (action.allow.length ? `Allow ${allowOverrideString} ` : '') +
        (action.deny.length ? `Deny ${denyOverrideString} ` : '') +
        (action.unset.length ? `Unset ${unsetOverrideString} ` : '');
      readableString = `Change permission override on ${overrideChannelString} for ${renderSubject(
        action.subject
      )} to: ${combinedOverrideString}`;
      break;
    case Action.AddPermissionOverrideOn:
      // Add permission override on General for Admin to: Allow a, b, c Deny a, b, c Unset a, b, c
      const addOverrideChannelString = renderChannelReference(action.channel);
      const allowAddOverrideString = action.allow
        .map(renderPermission)
        .join(', ');
      const unsetAddOverrideString = action.unset
        .map(renderPermission)
        .join(', ');
      const denyAddOverrideString = action.deny
        .map(renderPermission)
        .join(', ');
      const combinedAddOverrideString =
        (action.allow.length ? `Allow ${allowAddOverrideString} ` : '') +
        (action.deny.length ? `Deny ${denyAddOverrideString} ` : '') +
        (action.unset.length ? `Unset ${unsetAddOverrideString} ` : '');
      readableString = `Add permission override on ${addOverrideChannelString} for ${renderSubject(
        action.subject
      )} to: ${combinedAddOverrideString}`;
      break;
    case Action.RemovePermissionOverrideOn:
      // Remove permission override on General for Admin
      readableString = `Remove permission override on ${renderChannelReference(
        action.channel
      )} for ${renderSubject(action.subject)}`;
      break;
    case Action.ChangeRoleSetting:
      // Change duration to 2 on Admin
      readableString = `Change ${action.setting} to ${
        action.value
      } on ${renderRoleReference(action.role)}`;
      break;
    case Action.MoveRole:
      // Move Admin above Moderator
      readableString = `Move ${renderRoleReference(action.role)} ${
        action.direction
      } ${renderRoleReference(action.subject)}`;
      break;
    case Action.MoveChannel:
      // Move General above Images
      readableString = `Move ${renderChannelReference(action.channel)} ${
        action.direction
      } ${renderChannelReference(action.subject)}`;
      break;
    case Action.CreateChannel:
      readableString = `Create a ${action.type}${
        action.type != ChannelType.Category ? ' channel' : ''
      } called ${action.name}`;
      break;
    case Action.DestroyChannel:
      readableString = `Destroy ${renderChannelReference(action.channel)}`;
      break;
    case Action.ChangeServerSetting:
      let readableServerSettingValue: string;
      switch (action.setting) {
        case ServerSetting.AFKChannel:
          readableServerSettingValue = renderChannelReference(action.value);
          break;
        case ServerSetting.AFKTimeout:
          readableServerSettingValue = renderDurationString(action.value);
          break;
        case ServerSetting.Name:
          readableServerSettingValue = action.value;
          break;
        case ServerSetting.ContentFilter:
          readableServerSettingValue = action.value ? 'true' : 'false';
          break;
      }
      readableString = `Change ${action.setting} to ${readableServerSettingValue}`;
      break;
    case Action.ChangeChannelSetting:
      readableString = `Change ${action.setting} on ${renderChannelReference(
        action.channel
      )} to ${action.value}`;
      break;
    case Action.SetCategory:
      readableString = `Put ${renderChannelReference(
        action.channel
      )} under ${renderChannelReference(action.category)}`;
      break;
    case Action.SyncToCategory:
      readableString = `Sync ${renderChannelReference(
        action.channel
      )} to its parent category`;
      break;
    default:
      readableString = 'Could not parse action!';
  }
  return readableString;
}

// Very similar to validation except it
// operates on just strings and performs no network
// requests
function renderUserReference(ref: ResourceReference): string {
  if (ref.type == ReferenceType.Username) {
    return `${ref.username}#${ref.discriminator}`;
  }
  if (ref.type == ReferenceType.ID) {
    return `<@!${ref.id}>`;
  }
  return '<error>';
}

function renderRoleReference(ref: ResourceReference): string {
  if (ref.type == ReferenceType.FullName) {
    return ref.name;
  }
  if (ref.type == ReferenceType.ID) {
    return `<@&${ref.id}>`;
  }
  if (ref.type == ReferenceType.Pointer) {
    return `role created in action #${ref.index + 1}`;
  }
  return '<error>';
}

function renderChannelReference(ref: ResourceReference): string {
  if (ref.type == ReferenceType.FullName) {
    return ref.name;
  }
  if (ref.type == ReferenceType.ID) {
    return `<#${ref.id}>`;
  }
  if (ref.type == ReferenceType.Pointer) {
    return `channel created in action #${ref.index + 1}`;
  }
  return '<error>';
}
