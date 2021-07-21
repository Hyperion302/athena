export class OutOfBoundsError extends Error {
  constructor(message: string) {
    super(`OutOfBoundsError: ${message}`);
    Error.captureStackTrace(this, this.constructor);
  }
}
