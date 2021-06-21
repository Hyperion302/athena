export class CommandSyntaxError extends Error {
  constructor(message: string) {
    super(`Syntax error in command: ${message}`);
    Error.captureStackTrace(this, this.constructor);
  }
}
