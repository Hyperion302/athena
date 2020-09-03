export class ResourceNotFoundError extends Error {
  constructor(resource: 'action' | 'proposal', id: string) {
    super(`${resource} ${id} not found`);
    Error.captureStackTrace(this, this.constructor);
  }
}
