export class InternalError extends Error {
  constructor(message: string) {
    super(`InternalError: ${message}`);
    Error.captureStackTrace(this, this.constructor);
  }
}
