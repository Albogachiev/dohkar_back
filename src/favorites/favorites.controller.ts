import { Controller, Get, Post, Delete, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { FavoritesService } from "./favorites.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { FavoriteResponseDto } from "./dto/favorite-response.dto";

@ApiTags("favorites")
@Controller("favorites")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: "Получить список избранного" })
  @ApiResponse({ status: 200, description: "Список избранного", type: [FavoriteResponseDto] })
  findAll(@CurrentUser() user: any) {
    return this.favoritesService.findAll(user.id);
  }

  @Post(":propertyId")
  @ApiOperation({ summary: "Добавить объявление в избранное" })
  @ApiResponse({ status: 201, description: "Объявление добавлено в избранное", type: FavoriteResponseDto })
  @ApiResponse({ status: 404, description: "Объявление не найдено" })
  @ApiResponse({ status: 409, description: "Объявление уже в избранном" })
  add(@CurrentUser() user: any, @Param("propertyId") propertyId: string) {
    return this.favoritesService.add(user.id, propertyId);
  }

  @Delete(":propertyId")
  @ApiOperation({ summary: "Удалить объявление из избранного" })
  @ApiResponse({ status: 200, description: "Объявление удалено из избранного" })
  @ApiResponse({ status: 404, description: "Объявление не найдено в избранном" })
  remove(@CurrentUser() user: any, @Param("propertyId") propertyId: string) {
    return this.favoritesService.remove(user.id, propertyId);
  }
}
