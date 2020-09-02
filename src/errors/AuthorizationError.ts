export class AuthorizationError extends Error {
  constructor(action: string) {
    super(`AuthorizationError: Not authorized to ${action}`);
  }
}
