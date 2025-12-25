import { IsOptional, IsNumber, IsEnum, IsString, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PropertyType, Region } from "@prisma/client";

export class PropertyQueryDto {
  @ApiPropertyOptional({ example: "квартира" })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiPropertyOptional({ enum: PropertyType })
  @IsEnum(PropertyType)
  @IsOptional()
  type?: PropertyType;

  @ApiPropertyOptional({ example: 1000000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMin?: number;

  @ApiPropertyOptional({ example: 10000000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMax?: number;

  @ApiPropertyOptional({ example: 2 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  rooms?: number;

  @ApiPropertyOptional({ example: 50 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  areaMin?: number;

  @ApiPropertyOptional({ enum: Region })
  @IsEnum(Region)
  @IsOptional()
  region?: Region;

  @ApiPropertyOptional({ example: "price-asc", enum: ["price-asc", "price-desc", "date-desc", "relevance"] })
  @IsString()
  @IsOptional()
  sortBy?: "price-asc" | "price-desc" | "date-desc" | "relevance";

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 12, default: 12 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 12;
}
