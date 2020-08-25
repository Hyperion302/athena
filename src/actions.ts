import {
  tAction,
  Action,
  ResourceReference,
  ReferenceType,
  parseAction,
} from './actionParser';
import { Guild, User, Permissions } from 'discord.js';
import { knex } from './db';
import { client } from './client';

// Max sizes

const MAX_ROLE_NAME = 64;
const MAX_CHANNEL_NAME = 100;
const MIN_CHANNEL_NAME = 2;

interface ActionList {
  [key: number]: tAction;
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
      readableString = `Change ${action.setting} to ${action.value}`;
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

async function validateUserReference(
  server: Guild,
  ref: ResourceReference
): Promise<boolean> {
  if (ref.type == ReferenceType.Username) {
    const user = server.members.cache.find(
      (member) =>
        member.user.username == ref.username &&
        member.user.discriminator == ref.discriminator.toString()
    );
    return !!user;
  }
  if (ref.type == ReferenceType.ID) {
    const user = await server.members.fetch(ref.id);
    return !!user;
  }
  return false;
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

async function validateRoleReference(
  server: Guild,
  ref: ResourceReference
): Promise<boolean> {
  if (ref.type == ReferenceType.FullName) {
    const role = server.roles.cache.find((role) => role.name == ref.name);
    return !!role;
  }
  if (ref.type == ReferenceType.ID) {
    const role = await server.roles.fetch(ref.id);
    return !!role;
  }
  if (ref.type == ReferenceType.Output) {
    return true; // Validation of output reference occurs elsewhere
  }
  return false;
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

function validateChannelReference(
  server: Guild,
  ref: ResourceReference
): boolean {
  if (ref.type == ReferenceType.FullName) {
    const channel = server.channels.cache.find(
      (channel) => channel.name == ref.name
    );
    return !!channel;
  }
  if (ref.type == ReferenceType.ID) {
    const channel = server.channels.resolve(ref.id);
    return !!channel;
  }
  if (ref.type == ReferenceType.Output) {
    return true; // Validation of output reference occurs elsewhere
  }
  return false;
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

// Validates a single action
// NOTE: Ignores output reference validation
// This isn't best practice
export async function validateAction(
  server: Guild,
  action: tAction
): Promise<string | true> {
  if (action.action == Action.Kick) {
    const userRefValid = await validateUserReference(server, action.user);
    if (!userRefValid) return 'Invalid user reference';
    return true;
  }
  if (action.action == Action.Ban) {
    const userRefValid = await validateUserReference(server, action.user);
    if (!userRefValid) return 'Invalid user reference';
    return true;
  }
  if (action.action == Action.CreateRole) {
    if (action.name.length > MAX_ROLE_NAME) {
      return 'Role name too long';
    }
    return true;
  }
  if (action.action == Action.DestroyRole) {
    const roleRefValid = await validateRoleReference(server, action.role);
    if (!roleRefValid) return 'Invalid role reference';
    return true;
  }
  if (action.action == Action.ChangeRoleAssignment) {
    const roleRefValid = await validateRoleReference(server, action.role);
    if (!roleRefValid) return 'Invalid role reference';
    const grantsValid = (
      await Promise.all(
        action.grant.map((userRef) => validateUserReference(server, userRef))
      )
    ).every((valid) => valid);
    if (!grantsValid) return 'Invalid grant list';
    const revokesValid = (
      await Promise.all(
        action.revoke.map((userRef) => validateUserReference(server, userRef))
      )
    ).every((valid) => valid);
    if (!revokesValid) return 'Invalid revoke list';
    return true;
  }
  // The permissions have already been validated in previous steps
  if (action.action == Action.ChangeRolePermissions) {
    const roleRefValid = await validateRoleReference(server, action.role);
    if (!roleRefValid) return 'Invalid role reference';
    return true;
  }
  if (
    action.action == Action.AddPermissionOverrideOn ||
    action.action == Action.ChangePermissionOverrideOn ||
    action.action == Action.RemovePermissionOverrideOn
  ) {
    const channelRefValid = validateChannelReference(server, action.channel);
    if (!channelRefValid) return 'Invalid channel reference';
    const subjectRefValid =
      (await validateUserReference(server, action.subject)) ||
      (await validateRoleReference(server, action.subject));
    if (!subjectRefValid) return 'Invalid subject reference';
    return true;
  }
  if (action.action == Action.ChangeRoleSetting) {
    const roleRefValid = await validateRoleReference(server, action.role);
    if (!roleRefValid) return 'Invalid role reference';
    // TODO: Validate role setting bounds
    return true;
  }
  if (action.action == Action.MoveRole) {
    const roleRefValid = await validateRoleReference(server, action.role);
    if (!roleRefValid) return 'Invalid role reference';
    const subjectRefValid = await validateRoleReference(server, action.subject);
    if (!subjectRefValid) return 'Invalid subject reference';
    return true;
  }
  if (action.action == Action.MoveChannel) {
    const channelRefValid = validateChannelReference(server, action.channel);
    if (!channelRefValid) return 'Invalid channel reference';
    const subjectRefValid = validateChannelReference(server, action.channel);
    if (!subjectRefValid) return 'Invalid subject reference';
    return true;
  }
  if (action.action == Action.CreateChannel) {
    if (
      action.name.length > MAX_CHANNEL_NAME ||
      action.name.length < MIN_CHANNEL_NAME
    ) {
      return 'Channel name too long or too short';
    }
    return true;
  }
  if (action.action == Action.DestroyChannel) {
    const channelRefValid = validateChannelReference(server, action.channel);
    if (!channelRefValid) return 'Invalid channel reference';
    return true;
  }
  if (action.action == Action.ChangeServerSetting) {
    return true;
    // TODO: Validate setting values
  }
  if (action.action == Action.ChangeChannelSetting) {
    const channelRefValid = validateChannelReference(server, action.channel);
    if (!channelRefValid) return 'Invalid channel reference';
    return true;
  }
  return 'Unknown action';
}

// Runs individual validation on all actions and additionally validates
// output references
export async function validateActions(
  server: Guild,
  actions: tAction[]
): Promise<(string | true)[] | number[] | true> {
  const individualValidations = await Promise.all(
    actions.map((action) => validateAction(server, action))
  );
  const individualValidationSuccess = individualValidations.every(
    (validation) => validation == true
  );
  if (!individualValidationSuccess) return individualValidations;
  const invalidActionIndices: number[] = [];
  // Validate object references
  actions.forEach((action: tAction, index: number) => {
    switch (action.action) {
      // Actions without output references
      case Action.Kick:
      case Action.Ban:
      case Action.CreateRole:
      case Action.CreateChannel:
      case Action.ChangeServerSetting:
        break;
      // Actions with a role reference
      case Action.DestroyRole:
      case Action.ChangeRoleAssignment:
      case Action.ChangeRolePermissions:
      case Action.ChangeRoleSetting:
      case Action.MoveRole:
        if (action.role.type == ReferenceType.Output) {
          if (action.role.index >= actions.length) {
            invalidActionIndices.push(index);
            break;
          }
          const referencedAction = actions[action.role.index];
          if (referencedAction.action != Action.CreateRole) {
            invalidActionIndices.push(index);
          }
        }
        break;
      // Actions with both a channel and a subject
      case Action.AddPermissionOverrideOn:
      case Action.ChangePermissionOverrideOn:
        if (action.channel.type == ReferenceType.Output) {
          if (action.channel.index >= actions.length) {
            invalidActionIndices.push(index);
            break;
          }
          const referencedAction = actions[action.channel.index];
          if (referencedAction.action != Action.CreateChannel) {
            invalidActionIndices.push(index);
          }
        }
        if (action.subject.type == ReferenceType.Output) {
          const referencedAction = actions[action.subject.index];
          // Since the reference is an `Output`, it *must* be referencing
          // a role, not a user
          if (referencedAction.action != Action.CreateRole) {
            invalidActionIndices.push(index);
          }
        }
        break;
      // Actions with a channel reference
      case Action.ChangeChannelSetting:
      case Action.MoveChannel:
      case Action.DestroyChannel:
      case Action.RemovePermissionOverrideOn:
        if (action.channel.type == ReferenceType.Output) {
          if (action.channel.index >= actions.length) {
            invalidActionIndices.push(index);
            break;
          }
          const referencedAction = actions[action.channel.index];
          if (referencedAction.action != Action.CreateChannel) {
            invalidActionIndices.push(index);
          }
        }
        break;
    }
  });
  if (invalidActionIndices.length) return invalidActionIndices;
  return true;
}

// Gets a single action
// NOTE: Does NOT validate the action once retrieved
export async function getAction(
  proposal: string,
  index: number
): Promise<tAction> {
  const queryResults = await knex
    .select('*')
    .from('action')
    .where('proposal_id', proposal)
    .andWhere('id', index);
  if (queryResults.length < 1) throw new Error('Action not found');
  return parseAction(queryResults[0].action_string);
}

// Gets all actions on a proposal
// NOTE: Does NOT validate retrieved actions
export async function getActions(proposal: string): Promise<tAction[]> {
  const queryResults = await knex
    .select('*')
    .from('action')
    .where('proposal_id', proposal);
  const actionList: tAction[] = [];
  queryResults.forEach((actionRow) => {
    actionList[actionRow.id] = parseAction(actionRow.action_string);
  });
  return actionList;
}

export async function getNextIndex(proposal: string) {
  let newIndex = 0;
  // Get the highest index stored
  const indexes = await knex
    .select('id')
    .from('action')
    .where('proposal_id', proposal);
  if (indexes.length) {
    const sortedIndexes = indexes
      .map((index) => index.id)
      .sort((a, b) => a - b);
    newIndex = sortedIndexes.pop() + 1;
  }
  return newIndex;
}

// Creates an action
// NOTE: Does NOT validate action before creating
export async function createAction(
  proposal: string,
  index: number,
  actionString: string
): Promise<number> {
  await knex
    .insert({
      id: index,
      proposal_id: proposal,
      action_string: actionString,
    })
    .into('action');
  return index;
}

// Replaces a single action
// NOTE: Does NOT revalidate the action list
export async function replaceAction(
  proposal: string,
  index: number,
  newActionString: string
): Promise<void> {
  await knex
    .table('action')
    .update({ action_string: newActionString })
    .where('proposal_id', proposal)
    .andWhere('id', index);
}

// Deletes an action and adjusts all indexes
// NOTE: Does NOT revalidate the action list
export async function removeAction(
  proposal: string,
  index: number
): Promise<void> {
  await knex
    .table('action')
    .where('proposal_id', proposal)
    .andWhere('id', index)
    .del();
  // Fill hole
  await knex
    .table('action')
    .decrement('id')
    .where('proposal_id', proposal)
    .andWhere('id', '>', index)
    .orderBy('id', 'asc');
}

// Inserts an action and adjusts all indexes
// NOTE: Does NOT revalidate the action list
export async function insertAction(
  proposal: string,
  index: number,
  actionString: string
) {
  // Shift up
  await knex
    .table('action')
    .increment('id')
    .where('proposal_id', proposal)
    .andWhere('id', '>=', index)
    .orderBy('id', 'desc');
  await knex
    .insert({
      id: index,
      proposal_id: proposal,
      action_string: actionString,
    })
    .into('action');
}
