import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { PropertiesService } from "./properties.service";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { UpdatePropertyDto } from "./dto/update-property.dto";
import { PropertyQueryDto } from "./dto/property-query.dto";
import { PropertyResponseDto } from "./dto/property-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("properties")
@Controller("properties")
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Создать объявление" })
  @ApiResponse({ status: 201, description: "Объявление создано", type: PropertyResponseDto })
  create(@CurrentUser() user: any, @Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(user.id, createPropertyDto);
  }

  @Get()
  @ApiOperation({ summary: "Получить список объявлений с фильтрами" })
  @ApiResponse({ status: 200, description: "Список объявлений" })
  findAll(@Query() query: PropertyQueryDto) {
    return this.propertiesService.findAll(query);
  }

  @Get("search")
  @ApiOperation({ summary: "Поиск объявлений" })
  @ApiQuery({ name: "q", required: true, description: "Поисковый запрос" })
  @ApiResponse({ status: 200, description: "Результаты поиска", type: [PropertyResponseDto] })
  search(@Query("q") query: string) {
    return this.propertiesService.search(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить объявление по ID" })
  @ApiResponse({ status: 200, description: "Информация об объявлении", type: PropertyResponseDto })
  @ApiResponse({ status: 404, description: "Объявление не найдено" })
  findOne(@Param("id") id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Обновить объявление" })
  @ApiResponse({ status: 200, description: "Объявление обновлено", type: PropertyResponseDto })
  @ApiResponse({ status: 403, description: "Нет доступа" })
  @ApiResponse({ status: 404, description: "Объявление не найдено" })
  update(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body() updatePropertyDto: UpdatePropertyDto
  ) {
    return this.propertiesService.update(id, user.id, updatePropertyDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Удалить объявление" })
  @ApiResponse({ status: 200, description: "Объявление удалено" })
  @ApiResponse({ status: 403, description: "Нет доступа" })
  @ApiResponse({ status: 404, description: "Объявление не найдено" })
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.propertiesService.remove(id, user.id);
  }
}
