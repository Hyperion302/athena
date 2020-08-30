import { Permissions } from 'discord.js';
import {
  ResourceReference,
  ReferenceType,
  tAction,
  Action,
  ServerSetting,
} from '.';

export function getDurationString(duration: number): string {
  if (duration < 60) return `${duration} seconds`;
  if (duration < 60 * 60) return `${Math.floor(duration / 60)} minutes`;
  if (duration < 60 * 60 * 24)
    return `${Math.floor(duration / (60 * 60))} hours`;
  return `${Math.floor(duration / (60 * 60 * 24))} days`;
}

function permissionAsHumanReadable(permission: number): string {
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

function subjectAsHumanReadable(ref: ResourceReference): string {
  if (ref.type == ReferenceType.FullName) {
    return ref.name;
  }
  if (ref.type == ReferenceType.Output) {
    return `role created in action #${ref.index}`;
  }
  if (ref.type == ReferenceType.ID) {
    return `<@!${ref.id}>/<@&${ref.id}>`;
  }
  return '<error>';
}

export function actionAsHumanReadable(action: tAction): string {
  let readableString = '';
  switch (action.action) {
    case Action.Kick:
      readableString = `Kick ${userReferenceAsHumanReadable(action.user)}`;
      break;
    case Action.Ban:
      readableString = `Ban ${userReferenceAsHumanReadable(action.user)}`;
      break;
    case Action.CreateRole:
      readableString = `Create a role called ${action.name}`;
      break;
    case Action.DestroyRole:
      readableString = `Destroy ${roleReferenceAsHumanReadable}`;
      break;
    case Action.ChangeRoleAssignment:
      // Grant Admin to a, b, c
      // Revoke Admin from a, b, c
      // Grant Admin to a, b, c and revoke it from d, e, f
      const grantString = action.grant
        .map(userReferenceAsHumanReadable)
        .join(', ');
      const revokeString = action.revoke
        .map(userReferenceAsHumanReadable)
        .join(', ');
      const roleAssignmentString = roleReferenceAsHumanReadable(action.role);
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
      const allowString = action.allow
        .map(permissionAsHumanReadable)
        .join(', ');
      const denyString = action.deny.map(permissionAsHumanReadable).join(', ');
      const rolePermissionString = roleReferenceAsHumanReadable(action.role);
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
      const overrideChannelString = channelReferenceAsHumanReadable(
        action.channel
      );
      const allowOverrideString = action.allow
        .map(permissionAsHumanReadable)
        .join(', ');
      const unsetOverrideString = action.unset
        .map(permissionAsHumanReadable)
        .join(', ');
      const denyOverrideString = action.deny
        .map(permissionAsHumanReadable)
        .join(', ');
      const combinedOverrideString =
        (action.allow.length ? `Allow ${allowOverrideString} ` : '') +
        (action.deny.length ? `Deny ${denyOverrideString} ` : '') +
        (action.unset.length ? `Unset ${unsetOverrideString} ` : '');
      readableString = `Change permission override on ${overrideChannelString} for ${subjectAsHumanReadable(
        action.subject
      )} to: ${combinedOverrideString}`;
      break;
    case Action.AddPermissionOverrideOn:
      // Add permission override on General for Admin to: Allow a, b, c Deny a, b, c Unset a, b, c
      const addOverrideChannelString = channelReferenceAsHumanReadable(
        action.channel
      );
      const allowAddOverrideString = action.allow
        .map(permissionAsHumanReadable)
        .join(', ');
      const unsetAddOverrideString = action.unset
        .map(permissionAsHumanReadable)
        .join(', ');
      const denyAddOverrideString = action.deny
        .map(permissionAsHumanReadable)
        .join(', ');
      const combinedAddOverrideString =
        (action.allow.length ? `Allow ${allowAddOverrideString} ` : '') +
        (action.deny.length ? `Deny ${denyAddOverrideString} ` : '') +
        (action.unset.length ? `Unset ${unsetAddOverrideString} ` : '');
      readableString = `Add permission override on ${addOverrideChannelString} for ${subjectAsHumanReadable(
        action.subject
      )} to: ${combinedAddOverrideString}`;
      break;
    case Action.RemovePermissionOverrideOn:
      // Remove permission override on General for Admin
      readableString = `Remove permission override on ${channelReferenceAsHumanReadable(
        action.channel
      )} for ${subjectAsHumanReadable(action.subject)}`;
      break;
    case Action.ChangeRoleSetting:
      // Change duration to 2 on Admin
      readableString = `Change ${action.setting} to ${
        action.value
      } on ${roleReferenceAsHumanReadable(action.role)}`;
      break;
    case Action.MoveRole:
      // Move Admin above Moderator
      readableString = `Move ${roleReferenceAsHumanReadable(action.role)} ${
        action.direction
      } ${roleReferenceAsHumanReadable(action.subject)}`;
      break;
    case Action.MoveChannel:
      // Move General above Images
      readableString = `Move ${channelReferenceAsHumanReadable(
        action.channel
      )} ${action.direction} ${channelReferenceAsHumanReadable(
        action.subject
      )}`;
      break;
    case Action.CreateChannel:
      readableString = `Create a ${action.type} channel called ${action.name}`;
      break;
    case Action.DestroyChannel:
      readableString = `Destroy ${channelReferenceAsHumanReadable(
        action.channel
      )}`;
      break;
    case Action.ChangeServerSetting:
      let readableServerSettingValue: string;
      switch (action.setting) {
        case ServerSetting.AFKChannel:
          readableServerSettingValue = channelReferenceAsHumanReadable(
            action.value
          );
          break;
        case ServerSetting.AFKTimeout:
          readableServerSettingValue = getDurationString(action.value);
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
      readableString = `Change ${
        action.setting
      } on ${channelReferenceAsHumanReadable(action.channel)} to ${
        action.value
      }`;
      break;
    default:
      readableString = 'Could not parse action!';
  }
  return readableString;
}

// Very similar to validation except it
// operates on just strings and performs no network
// requests
function userReferenceAsHumanReadable(ref: ResourceReference): string {
  if (ref.type == ReferenceType.Username) {
    return `${ref.username}#${ref.discriminator}`;
  }
  if (ref.type == ReferenceType.ID) {
    return `<@!${ref.id}>`;
  }
  return '<error>';
}

function roleReferenceAsHumanReadable(ref: ResourceReference): string {
  if (ref.type == ReferenceType.FullName) {
    return ref.name;
  }
  if (ref.type == ReferenceType.ID) {
    return `<@&${ref.id}>`;
  }
  if (ref.type == ReferenceType.Output) {
    return `role created in action #${ref.index + 1}`;
  }
  return '<error>';
}

function channelReferenceAsHumanReadable(ref: ResourceReference): string {
  if (ref.type == ReferenceType.FullName) {
    return ref.name;
  }
  if (ref.type == ReferenceType.ID) {
    return `<#${ref.id}>`;
  }
  if (ref.type == ReferenceType.Output) {
    return `channel created in action #${ref.index + 1}`;
  }
  return '<error>';
}
