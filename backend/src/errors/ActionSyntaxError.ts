export class ActionSyntaxError extends Error {
  constructor(message: string) {
    super(`Syntax error in action: ${message}`);
    Error.captureStackTrace(this, this.constructor);
  }
}
