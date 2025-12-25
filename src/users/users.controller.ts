import { Controller, Get, Patch, Param, UseGuards, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";

@ApiTags("users")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("me")
  @ApiOperation({ summary: "Получить профиль текущего пользователя" })
  @ApiResponse({ status: 200, description: "Профиль пользователя", type: UserResponseDto })
  async getMe(@CurrentUser() user: any) {
    return this.usersService.getCurrentUser(user.id);
  }

  @Patch("me")
  @ApiOperation({ summary: "Обновить профиль текущего пользователя" })
  @ApiResponse({ status: 200, description: "Профиль обновлен", type: UserResponseDto })
  async updateMe(@CurrentUser() user: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateCurrentUser(user.id, updateUserDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить пользователя по ID" })
  @ApiResponse({ status: 200, description: "Информация о пользователе", type: UserResponseDto })
  @ApiResponse({ status: 404, description: "Пользователь не найден" })
  async getUserById(@Param("id") id: string) {
    return this.usersService.getUserById(id);
  }
}
