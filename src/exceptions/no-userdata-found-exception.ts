export class NoUserdataFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoUserdataFoundException";
    Object.setPrototypeOf(this, NoUserdataFoundException.prototype);
  }
}
