import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Ip,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { SendPhoneCodeDto } from "./dto/send-phone-code.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { VerifyPhoneCodeDto } from "./dto/verify-phone-code.dto";
import { RegisterPhonePasswordDto } from "./dto/register-phone-password.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { YandexAuthGuard } from "./guards/yandex-auth.guard";
import { LoginPhonePasswordDto } from "./dto/login-phone-password.dto";
import { AuthUserPayload } from "./types";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

@Post("send-code")
  @ApiOperation({ summary: "Отправить SMS-код на номер телефона" })
  @ApiResponse({ status: 201, description: "Код отправлен" })
  @ApiResponse({ status: 400, description: "Невалидный номер телефона" })
  @ApiResponse({ status: 429, description: "Слишком много попыток" })
async sendPhoneCode(@Body() dto: SendPhoneCodeDto,  @Ip() ip: string,) {
  return this.authService.sendPhoneCode(dto, ip);
}

@Post("phone/verify")
  @ApiOperation({ summary: "Подтвердить код и залогиниться/зарегистрироваться" })
  @ApiResponse({ status: 200, description: "Успешная аутентификация" })
  @ApiResponse({ status: 400, description: "Неверный или истёкший код" })
async verifyPhoneCode(@Body() dto: VerifyPhoneCodeDto) {
  return this.authService.verifyPhoneCode(dto.phone, dto.code);
}

  @Post("register/phone-password")
  @ApiOperation({ summary: "Регистрация по номеру телефона и паролю" })
  @ApiResponse({ status: 201, description: "Пользователь зарегистрирован" })
  async registerWithPhoneAndPassword(@Body() dto: RegisterPhonePasswordDto) {
    return this.authService.registerWithPhoneAndPassword(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login/phone-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Вход по номеру телефона и паролю" })
  @ApiResponse({ status: 200, description: "Успешная аутентификация" })
  async loginWithPhoneAndPassword(
    @CurrentUser() user: AuthUserPayload,
    @Body() _dto: LoginPhonePasswordDto
  ) {
    return this.authService.loginWithPhoneAndPassword(user);
  }

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Google OAuth" })
  async googleAuth() {
    return;
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Google OAuth callback" })
  async googleCallback(@CurrentUser() user: AuthUserPayload) {
    return this.authService.loginFromOAuth(user);
  }

  @Get("yandex")
  @UseGuards(YandexAuthGuard)
  @ApiOperation({ summary: "Yandex OAuth" })
  async yandexAuth() {
    return;
  }

  @Get("yandex/callback")
  @UseGuards(YandexAuthGuard)
  @ApiOperation({ summary: "Yandex OAuth callback" })
  async yandexCallback(@CurrentUser() user: AuthUserPayload) {
    return this.authService.loginFromOAuth(user);
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

}
