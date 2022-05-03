export interface JWTSet {
  access_token: string;
  refresh_token: string;
  access_token_exp: string;
  refresh_token_exp: string;
}

export interface UserProperties {
  email: string;
  id: string;
  roles: string[];
  password: string;
  name: string;
}

export interface LoginState {
  email: string;
  id: string;
  tokenSet: JWTSet;
  roles: string[];
  name: string;
}

export class UserNotFoundError extends Error {
  constructor(message = "Email/Password combination does not exist") {
    super(message);
  }
}

export class UserNotVerifiedError extends Error {
  constructor(message = "User needs to verify first") {
    super(message);
  }
}

export class UserAlreadyExists extends Error {
  constructor(message = "User already exists") {
    super(message);
  }
}
