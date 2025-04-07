export class TokenNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TokenNotFoundException";
    Object.setPrototypeOf(this, TokenNotFoundException.prototype);
  }
}
