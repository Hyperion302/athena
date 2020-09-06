type tResource = 'action' | 'proposal';
export class ResourceNotFoundError extends Error {
  public resourceType: tResource;
  public id: string;

  constructor(resource: tResource, id: string) {
    super(`${resource} '${id}' not found`);
    this.resourceType = resource;
    this.id = id;

    Error.captureStackTrace(this, this.constructor);
  }
}
