import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as argon2 from "argon2";
import { PrismaService } from "../common";
import { RegisterDto } from "./dto/send-phone-code.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthProvider, Prisma } from "@prisma/client";
import { addMinutes, subMinutes } from "date-fns";

const oauthUserSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  avatar: true,
  isPremium: true,
} satisfies Prisma.UserSelect;

type OAuthUserPayload = Prisma.UserGetPayload<{
  select: typeof oauthUserSelect;
}>;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(phone: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async sendPhoneCode(registerDto: RegisterDto, ip:string) {
    //проверка по номеру
    await this.checkRateLimit(registerDto.phone, registerDto.ip);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = addMinutes(new Date(), 5);

    const existingPhoneUser = await this.prisma.user.findUnique({
      where: { phone: registerDto.phone },
    });

    if (existingPhoneUser) {
      throw new ConflictException("Пользователь с таким номером уже существует");
    }

   await this.prisma.phoneCode.create({
      data: {
        phone: registerDto.phone,
        code,
        expiresAt,
        ip: registerDto.ip ?? null,
      },
    });

    // const tokens = await this.generateTokens(user.id);

    if (this.configService.get("NODE_ENV") === "development") {
      console.log(`Код для ${registerDto.phone}: ${code}`);
    }

    return { message: "Код отправлен" };
  }

  async verifyPhoneCode(){

  }

  async checkRateLimit(phone, ip){
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
        `Слишком много попыток. Попробуйте позже.`, HttpStatus.TOO_MANY_REQUESTS
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
          `Слишком много попыток с этого IP. Попробуйте позже.`, HttpStatus.TOO_MANY_REQUESTS
        );
      }
    }
  }

  async loginWithOAuth(
    provider: AuthProvider,
    providerId: string,
    email: string,
    name: string,
    avatar?: string
  ) {
    // Не все провайдеры всегда отдают стабильный providerId,
    // а Prisma не принимает undefined в where-условиях.
    const where: Prisma.UserWhereInput = {
      provider,
      ...(providerId ? { providerId } : {}),
    };

    let user: OAuthUserPayload | null = await this.prisma.user.findFirst({
      where,
      select: oauthUserSelect,
    });

    if (!user) {
      // Check if user exists with this email
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          avatar: true,
        },
      });

      if (existingUser) {
        // Link OAuth account to existing user
        user = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            provider,
            providerId,
            avatar: avatar || existingUser.avatar,
          },
          select: oauthUserSelect,
        });
      } else {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            name,
            avatar,
            provider,
            providerId,
          },
          select: oauthUserSelect,
        });
      }
    }

    if (!user) {
      throw new UnauthorizedException("Не удалось авторизовать пользователя");
    }

    const tokens = await this.generateTokens(user.id);

    return {
      ...tokens,
      user,
    };
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

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        isPremium: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Пользователь не найден");
    }

    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return {
        message: "Если пользователь существует, инструкции отправлены на email",
      };
    }

    // Generate reset token
    const resetToken = this.jwtService.sign(
      { userId: user.id, type: "password-reset" },
      {
        secret: this.configService.get<string>("JWT_SECRET"),
        expiresIn: "1h", // Reset token expires in 1 hour
      }
    );

    // Store reset token in database (using RefreshToken model for simplicity)
    // In production, you might want a separate PasswordResetToken model
    await this.prisma.refreshToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // TODO: Send email with reset link
    // In development, log the token to console
    if (this.configService.get<string>("NODE_ENV") === "development") {
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(
        `Reset link: ${this.configService.get<string>("FRONTEND_URL")}/auth/reset-password?token=${resetToken}`
      );
    }

    // In production, implement email sending:
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: "Инструкции отправлены на email" };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      // Verify token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });

      if (payload.type !== "password-reset") {
        throw new BadRequestException("Неверный токен сброса пароля");
      }

      // Check if token exists in database and is not expired
      const resetTokenRecord = await this.prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetTokenRecord || resetTokenRecord.expiresAt < new Date()) {
        throw new BadRequestException(
          "Токен сброса пароля недействителен или истек"
        );
      }

      // Hash new password
      const hashedPassword = await argon2.hash(newPassword);

      // Update user password
      await this.prisma.user.update({
        where: { id: resetTokenRecord.userId },
        data: { password: hashedPassword },
      });

      // Delete used reset token
      await this.prisma.refreshToken.delete({
        where: { token },
      });

      return { message: "Пароль успешно изменен" };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        "Неверный или истекший токен сброса пароля"
      );
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException(
        "Пользователь не найден или не имеет пароля"
      );
    }

    // Verify current password
    const isPasswordValid = await argon2.verify(user.password, currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Текущий пароль неверен");
    }

    // Hash new password
    const hashedPassword = await argon2.hash(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "Пароль успешно изменен" };
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
}
