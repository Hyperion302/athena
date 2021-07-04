// Maximum values
export const MIN_COLOR = 0;
export const MAX_COLOR = 16777215;

export {
  getAction,
  getActions,
  getNextIndex,
  createAction,
  replaceAction,
  removeAction,
  insertAction,
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
