import { tAction, Action, ReferenceType, IDResourceReference} from "athena-common";

// Maximum values
export const MIN_COLOR = 0;
export const MAX_COLOR = 16777215;

export function relatedIDs(action: tAction): string[] {
    switch (action.action) {
      case Action.CreateRole:
      case Action.CreateChannel:
      case Action.ChangeServerSetting:
        return [];
      // .user
      case Action.Kick:
      case Action.Ban:
        if (action.user.type === ReferenceType.ID) return [action.user.id];
        break;
      // .role
      case Action.DestroyRole:
      case Action.ChangeRolePermissions:
      case Action.ChangeRoleSetting:
        if (action.role.type === ReferenceType.ID) return [action.role.id];
        break;
      // .role & multi user
      case Action.ChangeRoleAssignment:
        const roleA = action.role.type === ReferenceType.ID ? [action.role.id] : [];
        const users = action.grant
          .concat(action.revoke)
          .filter(r => r.type === ReferenceType.ID)
          .map((r: IDResourceReference) => r.id)
        return roleA.concat(users);
      // .role & .subject
      case Action.MoveRole:
        const roleB = action.role.type === ReferenceType.ID ? [action.role.id] : [];
        const subjectA = action.subject.type === ReferenceType.ID ? [action.subject.id] : [];
        return roleB.concat(subjectA);
      // .channel & .subject
      case Action.ChangePermissionOverrideOn:
      case Action.RemovePermissionOverrideOn:
      case Action.MoveChannel:
        const channel = action.channel.type === ReferenceType.ID ? [action.channel.id] : [];
        const subjectB = action.subject.type === ReferenceType.ID ? [action.subject.id] : [];
        return channel.concat(subjectB);
      // .channel
      case Action.ChangeChannelSetting:
      case Action.DestroyChannel:
      case Action.SyncToCategory:
      case Action.SetCategory:
        if (action.channel.type === ReferenceType.ID) return [action.channel.id];
        break;
    }
    return [];
}

export {
  getAction,
  getActions,
  checkArchive,
  archiveName,
  removeArchive,
  createAction,
  removeAction,
} from './db';
export { executeActions } from './executor';
export {
  ReferenceValidationResult,
  ReferenceValidationError,
  ActionValidationResult,
  ActionValidationError,
  ProposalValidationResult,
  validateActions,
  validateAction,
} from './validator';
