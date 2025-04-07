export class CannotRefreshTokenException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CannotRefreshTokenException";
    Object.setPrototypeOf(this, CannotRefreshTokenException.prototype);
  }
}
