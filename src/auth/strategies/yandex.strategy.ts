import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Strategy } from "passport-yandex";
import { AuthProvider } from "@prisma/client";
import { AuthService } from "../auth.service";
import { AuthUserPayload } from "../types";

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, "yandex") {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    const clientID = configService.get<string>("oauth.yandex.clientId");
    const clientSecret = configService.get<string>("oauth.yandex.clientSecret");
    const callbackURL = configService.get<string>("oauth.yandex.callbackURL");

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error("Yandex OAuth не настроен. Укажите переменные окружения.");
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ["login:email", "login:info"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: unknown, user?: AuthUserPayload | false) => void
  ): Promise<void> {
    try {
      const user = await this.authService.handleOAuthLogin(AuthProvider.YANDEX, {
        providerId: profile.id,
        email: profile?.emails?.[0]?.value ?? profile?._json?.default_email,
      });
      done(null, user as AuthUserPayload);
    } catch (error) {
      done(error, false);
    }
  }
}
