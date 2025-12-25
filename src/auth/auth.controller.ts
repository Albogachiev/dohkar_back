import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Res,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { AuthProvider } from "@prisma/client";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  @Post("register")
  @ApiOperation({ summary: "Регистрация нового пользователя" })
  @ApiResponse({ status: 201, description: "Пользователь успешно зарегистрирован", type: AuthResponseDto })
  @ApiResponse({ status: 409, description: "Пользователь с таким email уже существует" })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Вход в систему" })
  @ApiResponse({ status: 200, description: "Успешный вход", type: AuthResponseDto })
  @ApiResponse({ status: 401, description: "Неверный email или пароль" })
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Обновление access token" })
  @ApiResponse({ status: 200, description: "Токен обновлен" })
  @ApiResponse({ status: 401, description: "Refresh token недействителен" })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Выход из системы" })
  @ApiResponse({ status: 200, description: "Выход выполнен" })
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Получить текущего пользователя" })
  @ApiResponse({ status: 200, description: "Информация о пользователе" })
  async getMe(@CurrentUser() user: any) {
    return this.authService.getCurrentUser(user.id);
  }

  @Get("google")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({ summary: "Инициация Google OAuth" })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({ summary: "Google OAuth callback" })
  async googleAuthCallback(@Request() req, @Res() res: Response) {
    const user = req.user;
    const result = await this.authService.loginWithOAuth(
      AuthProvider.GOOGLE,
      user.providerId,
      user.email,
      user.name,
      user.avatar
    );

    const frontendUrl = this.configService.get<string>("frontend.url");
    res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}`);
  }

  @Get("yandex")
  @UseGuards(AuthGuard("yandex"))
  @ApiOperation({ summary: "Инициация Yandex OAuth" })
  async yandexAuth() {
    // Guard redirects to Yandex
  }

  @Get("yandex/callback")
  @UseGuards(AuthGuard("yandex"))
  @ApiOperation({ summary: "Yandex OAuth callback" })
  async yandexAuthCallback(@Request() req, @Res() res: Response) {
    const user = req.user;
    const result = await this.authService.loginWithOAuth(
      AuthProvider.YANDEX,
      user.providerId,
      user.email,
      user.name,
      user.avatar
    );

    const frontendUrl = this.configService.get<string>("frontend.url");
    res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}`);
  }

  @Get("vk")
  @UseGuards(AuthGuard("vkontakte"))
  @ApiOperation({ summary: "Инициация VK OAuth" })
  async vkAuth() {
    // Guard redirects to VK
  }

  @Get("vk/callback")
  @UseGuards(AuthGuard("vkontakte"))
  @ApiOperation({ summary: "VK OAuth callback" })
  async vkAuthCallback(@Request() req, @Res() res: Response) {
    const user = req.user;
    const result = await this.authService.loginWithOAuth(
      AuthProvider.VK,
      user.providerId,
      user.email,
      user.name,
      user.avatar
    );

    const frontendUrl = this.configService.get<string>("frontend.url");
    res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}`);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Восстановление пароля" })
  @ApiResponse({ status: 200, description: "Инструкции отправлены на email" })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Сброс пароля" })
  @ApiResponse({ status: 200, description: "Пароль успешно изменен" })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post("change-password")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Изменение пароля" })
  @ApiResponse({ status: 200, description: "Пароль успешно изменен" })
  @ApiResponse({ status: 401, description: "Текущий пароль неверен" })
  async changePassword(@CurrentUser() user: any, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(
      user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword
    );
  }
}
