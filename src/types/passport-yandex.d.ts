declare module "passport-yandex" {
  import { Strategy as PassportStrategy } from "passport";

  interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    passReqToCallback?: boolean;
  }

  type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: unknown, user?: unknown, info?: unknown) => void
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
  }
}
