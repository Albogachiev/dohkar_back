import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Strategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { AuthProvider } from "@prisma/client";
import { AuthService } from "../auth.service";
import { AuthUserPayload } from "../types";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    const clientID = configService.get<string>("oauth.google.clientId");
    const clientSecret = configService.get<string>("oauth.google.clientSecret");
    const callbackURL = configService.get<string>("oauth.google.callbackURL");

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error("Google OAuth не настроен. Укажите переменные окружения.");
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ["email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): Promise<void> {
    try {
      const user = await this.authService.handleOAuthLogin(AuthProvider.GOOGLE, {
        providerId: profile.id,
        email: profile.emails?.[0]?.value,
      });
      done(null, user as AuthUserPayload);
    } catch (error) {
      done(error, false);
    }
  }
}
