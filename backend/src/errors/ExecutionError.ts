export class ExecutionError extends Error {
  constructor(index: number, message: string) {
    super(`Action ${index}: ${message}`);
    Error.captureStackTrace(this, this.constructor);
  }
}
