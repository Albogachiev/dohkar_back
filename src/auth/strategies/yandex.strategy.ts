import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-yandex";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, "yandex") {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>("oauth.yandex.clientId"),
      clientSecret: configService.get<string>("oauth.yandex.clientSecret"),
      callbackURL: configService.get<string>("oauth.yandex.callbackURL"),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void
  ): Promise<any> {
    const user = {
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName || profile.name?.givenName + " " + profile.name?.familyName,
      avatar: profile.photos?.[0]?.value,
      accessToken,
    };
    done(null, user);
  }
}
