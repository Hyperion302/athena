import {
  ReferenceType,
  ResourceReference,
  Action,
  MAX_ROLE_NAME,
  MAX_CHANNEL_NAME,
  MIN_CHANNEL_NAME,
  tAction,
} from '.';
import { Guild } from 'discord.js';

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
  if (ref.type == ReferenceType.Pointer) {
    return true; // Validation of output reference occurs elsewhere
  }
  return false;
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
  if (ref.type == ReferenceType.Pointer) {
    return true; // Validation of output reference occurs elsewhere
  }
  return false;
}

async function validateUserOrRoleReference(
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
    try {
      const user = await server.members.fetch(ref.id);
      return !!user;
    } catch (e) {
      try {
        const role = await server.roles.fetch(ref.id);
        return !!role;
      } catch (e) {
        return false;
      }
    }
  }
  if (ref.type == ReferenceType.FullName) {
    const role = server.roles.cache.find((role) => role.name == ref.name);
    return !!role;
  }
  if (ref.type == ReferenceType.Pointer) {
    return true; // Validation of output reference occurs elsewhere
  }
  return false;
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
        action.grant.map((userRef) => validateRoleReference(server, userRef))
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
    const subjectRefValid = await validateUserOrRoleReference(
      server,
      action.subject
    );
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
        if (action.role.type == ReferenceType.Pointer) {
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
        if (action.channel.type == ReferenceType.Pointer) {
          if (action.channel.index >= actions.length) {
            invalidActionIndices.push(index);
            break;
          }
          const referencedAction = actions[action.channel.index];
          if (referencedAction.action != Action.CreateChannel) {
            invalidActionIndices.push(index);
          }
        }
        if (action.subject.type == ReferenceType.Pointer) {
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
        if (action.channel.type == ReferenceType.Pointer) {
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
