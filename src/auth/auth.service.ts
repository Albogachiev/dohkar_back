import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as argon2 from "argon2";
import { PrismaService } from "../common";
import { SendPhoneCodeDto } from "./dto/send-phone-code.dto";
import { AuthProvider } from "@prisma/client";
import { addMinutes, subMinutes } from "date-fns";
import { SMSRu } from 'node-sms-ru';
import { RegisterPhonePasswordDto } from "./dto/register-phone-password.dto";
import { AuthUserPayload, authUserSelect } from "./types";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly smsRu: SMSRu
  ) {}

  async sendPhoneCode(sendPhoneCodeDto: SendPhoneCodeDto, ip?: string) {
    await this.checkRateLimit(sendPhoneCodeDto.phone, ip);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = addMinutes(new Date(), 5);

    await this.prisma.phoneCode.create({
      data: {
        phone: sendPhoneCodeDto.phone,
        code,
        expiresAt,
        ip: ip ?? null,
      },
    });

    await this.smsRu.sendSms({ 
      to: sendPhoneCodeDto.phone,
      msg: code, });

    return { message: "Код отправлен" };
  }

  async verifyPhoneCode(phone: string, code: string){
  const now = new Date();

    const phoneCode = await this.prisma.phoneCode.findFirst({
      where: {
        phone,
        code,
        expiresAt: { gt: now },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!phoneCode) {
      throw new BadRequestException("Неверный или истекший код");
    }

    // Ищем пользователя по телефону
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    // Если не нашли — регистрируем нового
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          provider: AuthProvider.LOCAL,
        },
      });
    }

      // Код использовать можно один раз — удаляем все записи с этим кодом и телефоном
    await this.prisma.phoneCode.deleteMany({
      where: { phone, code },
    });

    return this.buildAuthResponse(user.id);
  }

  async checkRateLimit(phone: string, ip?: string) {
    const now = new Date();
    const windowMinutes = 10;
    const windowStart = subMinutes(now, windowMinutes);

    const MAX_PER_PHONE = 3;
    const MAX_PER_IP = 10;

    const phoneRequestsCount = await this.prisma.phoneCode.count({
      where: {
        phone,
        createdAt: {
          gte: windowStart,
        },
      },
    });

    if (phoneRequestsCount >= MAX_PER_PHONE) {
      throw new HttpException(
        "Слишком много попыток. Попробуйте позже.",
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    if (ip) {
      const ipRequestsCount = await this.prisma.phoneCode.count({
        where: {
          ip,
          createdAt: {
            gte: windowStart,
          },
        },
      });

      if (ipRequestsCount >= MAX_PER_IP) {
        throw new HttpException(
          "Слишком много попыток с этого IP. Попробуйте позже.",
          HttpStatus.TOO_MANY_REQUESTS
        );
      }
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>("jwt.refreshSecret"),
      });

      const tokenRecord = await this.prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: payload.sub,
          expiresAt: { gt: new Date() },
        },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException("Refresh token недействителен");
      }

      const tokens = await this.generateTokens(payload.sub);

      // Delete old refresh token
      await this.prisma.refreshToken
        .delete({
          where: { id: tokenRecord.id },
        })
        .catch(() => {
          // Ignore if already deleted
        });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException("Refresh token недействителен");
    }
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return { message: "Выход выполнен успешно" };
  }

  // async getCurrentUser(userId: string) {
  //   const user = await this.prisma.user.findUnique({
  //     where: { id: userId },
  //     select: {
  //       id: true,
  //       phone: true,
  //       isPremium: true,
  //       role: true,
  //       createdAt: true,
  //     },
  //   });

  //   if (!user) {
  //     throw new UnauthorizedException("Пользователь не найден");
  //   }

  //   return user;
  // }

  async registerWithPhoneAndPassword(dto: RegisterPhonePasswordDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException("Пользователь с таким номером уже существует");
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        passwordHash,
        provider: AuthProvider.LOCAL,
      },
      select: authUserSelect,
    });

    return this.buildAuthResponse(user.id);
  }

  async validateLocalUser(phone: string, password: string): Promise<AuthUserPayload> {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Неверный телефон или пароль");
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Неверный телефон или пароль");
    }

    return this.getUserPayload(user.id);
  }

  async loginWithPhoneAndPassword(user: AuthUserPayload) {
    return this.buildAuthResponse(user.id);
  }

  async handleOAuthLogin(
    provider: AuthProvider,
    profile: { providerId: string; email?: string }
  ): Promise<AuthUserPayload> {
    const userFromProvider = await this.prisma.user.findFirst({
      where: { provider, providerId: profile.providerId },
      select: authUserSelect,
    });

    if (userFromProvider) {
      return userFromProvider;
    }

    if (profile.email) {
      const userByEmail = await this.prisma.user.findUnique({
        where: { email: profile.email },
        select: authUserSelect,
      });

      if (userByEmail) {
        return this.prisma.user.update({
          where: { id: userByEmail.id },
          data: {
            provider,
            providerId: profile.providerId,
          },
          select: authUserSelect,
        });
      }
    }

    return this.prisma.user.create({
      data: {
        email: profile.email,
        provider,
        providerId: profile.providerId,
      },
      select: authUserSelect,
    });
  }

  async loginFromOAuth(user: AuthUserPayload) {
    return this.buildAuthResponse(user.id);
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("jwt.secret"),
        expiresIn: this.configService.get<string>("jwt.expiresIn"),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("jwt.refreshSecret"),
        expiresIn: this.configService.get<string>("jwt.refreshExpiresIn"),
      }),
    ]);

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() +
        parseInt(
          this.configService
            .get<string>("jwt.refreshExpiresIn")
            .replace("d", "")
        )
    );

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async buildAuthResponse(userId: string) {
    const [tokens, user] = await Promise.all([
      this.generateTokens(userId),
      this.getUserPayload(userId),
    ]);

    return {
      ...tokens,
      user,
    };
  }

  private async getUserPayload(userId: string): Promise<AuthUserPayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: authUserSelect,
    });

    if (!user) {
      throw new UnauthorizedException("Пользователь не найден");
    }

    return user;
  }
}
