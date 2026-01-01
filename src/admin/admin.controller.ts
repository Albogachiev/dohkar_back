import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto";
import { UpdatePropertyStatusDto } from "./dto/update-property-status.dto";
import { PropertyStatus, PropertyType } from "@prisma/client";

@ApiTags("admin")
@Controller("admin")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get("statistics")
  @ApiOperation({ summary: "Получить статистику" })
  @ApiResponse({ status: 200, description: "Статистика получена" })
  async getStatistics() {
    return this.adminService.getStatistics();
  }

  @Get("users")
  @ApiOperation({ summary: "Получить список пользователей" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Список пользователей" })
  async getUsers(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.adminService.getUsers(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10
    );
  }

  @Get("properties")
  @ApiOperation({ summary: "Получить список объявлений" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "status", required: false, enum: PropertyStatus })
  @ApiQuery({ name: "type", required: false, enum: PropertyType })
  @ApiResponse({ status: 200, description: "Список объявлений" })
  async getProperties(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("status") status?: PropertyStatus,
    @Query("type") type?: PropertyType
  ) {
    return this.adminService.getProperties(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      status,
      type
    );
  }

  @Patch("users/:id/role")
  @ApiOperation({ summary: "Изменить роль пользователя" })
  @ApiResponse({ status: 200, description: "Роль изменена" })
  async updateUserRole(
    @Param("id") userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto
  ) {
    return this.adminService.updateUserRole(userId, updateUserRoleDto.role);
  }

  @Patch("properties/:id/status")
  @ApiOperation({ summary: "Изменить статус объявления" })
  @ApiResponse({ status: 200, description: "Статус изменен" })
  async updatePropertyStatus(
    @Param("id") propertyId: string,
    @Body() updatePropertyStatusDto: UpdatePropertyStatusDto
  ) {
    return this.adminService.updatePropertyStatus(propertyId, updatePropertyStatusDto.status);
  }

  @Delete("users/:id")
  @ApiOperation({ summary: "Удалить пользователя" })
  @ApiResponse({ status: 200, description: "Пользователь удален" })
  async deleteUser(@Param("id") userId: string) {
    return this.adminService.deleteUser(userId);
  }

  @Delete("properties/:id")
  @ApiOperation({ summary: "Удалить объявление" })
  @ApiResponse({ status: 200, description: "Объявление удалено" })
  async deleteProperty(@Param("id") propertyId: string) {
    return this.adminService.deleteProperty(propertyId);
  }
}
