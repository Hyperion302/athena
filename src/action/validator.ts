import {
  ReferenceType,
  ResourceReference,
  Action,
  tAction,
  ServerSetting,
  MAX_CHANNEL_LENGTH,
  MIN_CHANNEL_LENGTH,
} from '.';
import { Guild } from 'discord.js';

export interface ReferenceValidationResult {
  valid: boolean;
  error?: ReferenceValidationError;
}

export enum ReferenceValidationError {
  NullReference,
  InvalidReferenceType,
}

export interface ActionValidationResult {
  valid: boolean;
  referenceValidations: ReferenceValidationResult[]; // Unordered
  error?: ActionValidationError;
}

export enum ActionValidationError {
  InvalidActionType,
}

export interface ProposalValidationResult {
  valid: boolean;
  actionValidations: ActionValidationResult[]; // Ordered
  invalidActions: number[];
}

async function validateUserReference(
  server: Guild,
  ref: ResourceReference
): Promise<ReferenceValidationResult> {
  if (ref.type == ReferenceType.Username) {
    const user = server.members.cache.find(
      (member) =>
        member.user.username == ref.username &&
        member.user.discriminator == ref.discriminator.toString()
    );
    if (user) return { valid: true };
    return { valid: false, error: ReferenceValidationError.NullReference };
  }
  if (ref.type == ReferenceType.ID) {
    const user = await server.members.fetch(ref.id);
    if (user) return { valid: true };
    return { valid: false, error: ReferenceValidationError.NullReference };
  }
  return { valid: false, error: ReferenceValidationError.InvalidReferenceType };
}

async function validateRoleReference(
  server: Guild,
  ref: ResourceReference
): Promise<ReferenceValidationResult> {
  if (ref.type == ReferenceType.FullName) {
    const role = server.roles.cache.find((role) => role.name == ref.name);
    if (role) return { valid: true };
    return { valid: false, error: ReferenceValidationError.NullReference };
  }
  if (ref.type == ReferenceType.ID) {
    const role = await server.roles.fetch(ref.id);
    if (role) return { valid: true };
    return { valid: false, error: ReferenceValidationError.NullReference };
  }
  if (ref.type == ReferenceType.Pointer) {
    return { valid: true };
  }
  return { valid: false, error: ReferenceValidationError.InvalidReferenceType };
}

function validateChannelReference(
  server: Guild,
  ref: ResourceReference
): ReferenceValidationResult {
  if (ref.type == ReferenceType.FullName) {
    const channel = server.channels.cache.find(
      (channel) => channel.name == ref.name
    );
    if (channel) return { valid: true };
    return { valid: false, error: ReferenceValidationError.NullReference };
  }
  if (ref.type == ReferenceType.ID) {
    const channel = server.channels.resolve(ref.id);
    if (channel) return { valid: true };
    return { valid: false, error: ReferenceValidationError.NullReference };
  }
  if (ref.type == ReferenceType.Pointer) {
    return { valid: true };
  }
  return { valid: false, error: ReferenceValidationError.InvalidReferenceType };
}

async function validateUserOrRoleReference(
  server: Guild,
  ref: ResourceReference
): Promise<ReferenceValidationResult> {
  if (ref.type == ReferenceType.Username) {
    const user = server.members.cache.find(
      (member) =>
        member.user.username == ref.username &&
        member.user.discriminator == ref.discriminator.toString()
    );
    if (user) return { valid: true };
    return { valid: false, error: ReferenceValidationError.NullReference };
  }
  if (ref.type == ReferenceType.ID) {
    try {
      const user = await server.members.fetch(ref.id);
      if (user) return { valid: true };
      if (!user) {
        return { valid: false, error: ReferenceValidationError.NullReference };
      }
    } catch (e) {
      try {
        const role = await server.roles.fetch(ref.id);
        if (role) return { valid: true };
        if (!role) {
          return {
            valid: false,
            error: ReferenceValidationError.NullReference,
          };
        }
      } catch (e) {
        return { valid: false, error: ReferenceValidationError.NullReference };
      }
    }
  }
  if (ref.type == ReferenceType.FullName) {
    const role = server.roles.cache.find((role) => role.name == ref.name);
    if (role) return { valid: true };
    return { valid: false, error: ReferenceValidationError.NullReference };
  }
  if (ref.type == ReferenceType.Pointer) {
    return { valid: true };
  }
  return { valid: false, error: ReferenceValidationError.InvalidReferenceType };
}

// Validates a single action
// NOTE: Ignores output reference validation
// This isn't best practice
export async function validateAction(
  server: Guild,
  action: tAction
): Promise<ActionValidationResult> {
  if (action.action == Action.Kick || action.action == Action.Ban) {
    const userValidation = await validateUserReference(server, action.user);
    return {
      valid: userValidation.valid,
      referenceValidations: [userValidation],
    };
  }
  if (action.action == Action.CreateRole) {
    return { valid: true, referenceValidations: [] };
  }
  if (action.action == Action.DestroyRole) {
    const roleValidation = await validateRoleReference(server, action.role);
    return {
      valid: roleValidation.valid,
      referenceValidations: [roleValidation],
    };
  }
  if (action.action == Action.ChangeRoleAssignment) {
    const roleValidation = await validateRoleReference(server, action.role);
    const grantValidation = await Promise.all(
      action.grant.map((grant) => validateUserReference(server, grant))
    );
    const revokeValidation = await Promise.all(
      action.revoke.map((grant) => validateUserReference(server, grant))
    );
    const validations = [
      roleValidation,
      ...grantValidation,
      ...revokeValidation,
    ];
    return {
      valid: validations.every((validation) => validation.valid),
      referenceValidations: validations,
    };
  }
  // The permissions have already been validated in previous steps
  if (action.action == Action.ChangeRolePermissions) {
    const roleValidation = await validateRoleReference(server, action.role);
    return {
      valid: roleValidation.valid,
      referenceValidations: [roleValidation],
    };
  }
  if (
    action.action == Action.AddPermissionOverrideOn ||
    action.action == Action.ChangePermissionOverrideOn ||
    action.action == Action.RemovePermissionOverrideOn
  ) {
    const channelValidation = validateChannelReference(server, action.channel);
    const subjectValidation = await validateUserOrRoleReference(
      server,
      action.subject
    );
    return {
      valid: channelValidation.valid && subjectValidation.valid,
      referenceValidations: [channelValidation, subjectValidation],
    };
  }
  if (action.action == Action.ChangeRoleSetting) {
    const roleValidation = await validateRoleReference(server, action.role);
    return {
      valid: roleValidation.valid,
      referenceValidations: [roleValidation],
    };
  }
  if (action.action == Action.MoveRole) {
    const roleValidation = await validateRoleReference(server, action.role);
    const subjectValidation = await validateRoleReference(
      server,
      action.subject
    );
    return {
      valid: roleValidation.valid && subjectValidation.valid,
      referenceValidations: [roleValidation, subjectValidation],
    };
  }
  if (action.action == Action.MoveChannel) {
    const channelValidation = validateChannelReference(server, action.channel);
    const subjectValidation = validateChannelReference(server, action.channel);
    return {
      valid: channelValidation.valid && subjectValidation.valid,
      referenceValidations: [channelValidation, subjectValidation],
    };
  }
  if (action.action == Action.CreateChannel) {
    return {
      valid: true,
      referenceValidations: [],
    };
  }
  if (action.action == Action.DestroyChannel) {
    const channelValidation = validateChannelReference(server, action.channel);
    return {
      valid: channelValidation.valid,
      referenceValidations: [channelValidation],
    };
  }
  if (action.action == Action.ChangeServerSetting) {
    if (action.setting == ServerSetting.AFKChannel) {
      const channelValidation = validateChannelReference(server, action.value);
      return {
        valid: channelValidation.valid,
        referenceValidations: [channelValidation],
      };
    }
    return { valid: true, referenceValidations: [] };
  }
  if (action.action == Action.ChangeChannelSetting) {
    const channelValidation = validateChannelReference(server, action.channel);
    return {
      valid: channelValidation.valid,
      referenceValidations: [channelValidation],
    };
  }
  return {
    valid: false,
    referenceValidations: [],
    error: ActionValidationError.InvalidActionType,
  };
}

// Runs individual validation on all actions and additionally validates
// output references
export async function validateActions(
  server: Guild,
  actions: tAction[]
): Promise<ProposalValidationResult> {
  const actionValidations = await Promise.all(
    actions.map((action) => validateAction(server, action))
  );
  const actionValidationSuccess = actionValidations.every(
    (validation) => validation.valid
  );
  if (!actionValidationSuccess) {
    return {
      valid: false,
      actionValidations,
      invalidActions: [],
    };
  }
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
  return {
    valid: invalidActionIndices.length ? false : true,
    actionValidations,
    invalidActions: invalidActionIndices,
  };
}
