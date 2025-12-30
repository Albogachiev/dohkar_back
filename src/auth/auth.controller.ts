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
  Ip,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { SendPhoneCodeDto } from "./dto/send-phone-code.dto";
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
import { VerifyPhoneCodeDto } from "./dto/verify-phone-code.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  @Post("send-code")
async sendPhoneCode(@Body() dto: SendPhoneCodeDto,  @Ip() ip: string,) {
  return this.authService.sendPhoneCode(dto, ip);
}

@Post("phone/verify")
async verifyPhoneCode(@Body() dto: VerifyPhoneCodeDto) {
  return this.authService.verifyPhoneCode(dto.phone, dto.code);
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
