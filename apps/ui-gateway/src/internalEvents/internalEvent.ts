export class InternalEvent<T> {
  public type: string;
  public payloadType: T;
  constructor(type: string) {
    this.type = `internalEvent.${type}`;
  }

  new(payload: T): T & { type: string } {
    return {
      ...payload,
      type: this.type,
    };
  }
}
