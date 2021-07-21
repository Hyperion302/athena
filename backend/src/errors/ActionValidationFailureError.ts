import {
  ActionValidationResult,
  ActionValidationError,
  ReferenceValidationError,
} from '../action';

export class ActionValidationFailureError extends Error {
  constructor(validationResult: ActionValidationResult) {
    if (validationResult.error) {
      super(`Validation failure: Unrecognized action type`);
    } else {
      const errorString = validationResult.referenceValidations
        .map((referenceValidation) => {
          switch (referenceValidation.error) {
            case ReferenceValidationError.NullReference:
              return 'Reference points to nonexistent object';
            case ReferenceValidationError.InvalidReferenceType:
              return 'Unrecognized reference type';
            default:
              return '';
          }
        })
        .join('&');
      super(`Validation failures: ${errorString}`);
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
