export class StateError extends Error {
  constructor(message: string) {
    super(`StateError: ${message}`);
    Error.captureStackTrace(this, this.constructor);
  }
}
