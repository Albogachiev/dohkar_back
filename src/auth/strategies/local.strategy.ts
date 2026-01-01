import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { AuthUserPayload } from "../types";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: "phone",
      passwordField: "password",
    });
  }

  async validate(phone: string, password: string): Promise<AuthUserPayload> {
    return this.authService.validateLocalUser(phone, password);
  }
}
