import { ProposalValidationResult } from '../action';

export class ActionsValidationFailureError extends Error {
  constructor(validationResult: ProposalValidationResult) {
    super(
      `Validation failure: Actions ${validationResult.invalidActions.join(
        ' & '
      )} are invalid`
    );
  }
}
