export class Return extends Error {
  constructor(public readonly value: Object) {
    super();
    Object.setPrototypeOf(this, Return.prototype);
  }
}
