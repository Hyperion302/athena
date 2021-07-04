import {
  ResourceReference,
  ReferenceType,
  tAction,
  Action,
  ChannelType,
} from "athena-common";
import { Guild } from 'discord.js';
import { validators } from '@/action/actions';

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

export async function validateUserReference(
  server: Guild,
  ref: ResourceReference
): Promise<ReferenceValidationResult> {
  if (ref.type == ReferenceType.ID) {
    const user = await server.members.fetch(ref.id);
    if (user) return { valid: true };
    return { valid: false, error: ReferenceValidationError.NullReference };
  }
  return { valid: false, error: ReferenceValidationError.InvalidReferenceType };
}

export async function validateRoleReference(
  server: Guild,
  ref: ResourceReference
): Promise<ReferenceValidationResult> {
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

export function validateChannelReference(
  server: Guild,
  ref: ResourceReference
): ReferenceValidationResult {
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

export async function validateUserOrRoleReference(
  server: Guild,
  ref: ResourceReference
): Promise<ReferenceValidationResult> {
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
  if (ref.type == ReferenceType.Pointer) {
    return { valid: true };
  }
  return { valid: false, error: ReferenceValidationError.InvalidReferenceType };
}

export async function validateCategoryReference(
  server: Guild,
  ref: ResourceReference
): Promise<ReferenceValidationResult> {
  if (ref.type == ReferenceType.ID) {
    const channel = server.channels.cache.get(ref.id);
    if (!channel) {
      return { valid: false, error: ReferenceValidationError.NullReference };
    }
    if (channel.type != 'category') {
      return {
        valid: false,
        error: ReferenceValidationError.InvalidReferenceType,
      };
    }
    return { valid: true };
  }
  if (ref.type == ReferenceType.Pointer) {
    return { valid: true };
  }
  return { valid: false, error: ReferenceValidationError.InvalidReferenceType };
}

// Validates a single action
// NOTE: Ignores output reference validation
export async function validateAction(
  server: Guild,
  action: tAction
): Promise<ActionValidationResult> {
  const validator = validators[action.action];
  if (!validator) {
    return {
      valid: false,
      referenceValidations: [],
      error: ActionValidationError.InvalidActionType,
    };
  }
  return await validator(server, action);
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
      case Action.SyncToCategory:
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
      // Special
      case Action.SetCategory:
        if (action.channel.type == ReferenceType.Pointer) {
          if (action.channel.index >= actions.length) {
            invalidActionIndices.push(index);
            break;
          }
          const referencedAction = actions[action.channel.index];
          if (
            referencedAction.action != Action.CreateChannel ||
            referencedAction.type == ChannelType.Category
          ) {
            invalidActionIndices.push(index);
            break;
          }
        }
        if (action.category.type == ReferenceType.Pointer) {
          if (action.category.index >= actions.length) {
            invalidActionIndices.push(index);
            break;
          }
          const referencedAction = actions[action.category.index];
          if (
            referencedAction.action != Action.CreateChannel ||
            referencedAction.type != ChannelType.Category
          ) {
            invalidActionIndices.push(index);
            break;
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
