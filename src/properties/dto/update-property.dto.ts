import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  Min,
  ArrayMinSize,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PropertyType, Currency, Region, PropertyStatus } from "@prisma/client";

export class UpdatePropertyDto {
  @ApiPropertyOptional({ example: "Квартира в центре Грозного" })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 5000000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ enum: Currency })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @ApiPropertyOptional({ example: "г. Грозный, ул. Ленина, д. 10" })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ enum: Region })
  @IsEnum(Region)
  @IsOptional()
  region?: Region;

  @ApiPropertyOptional({ enum: PropertyType })
  @IsEnum(PropertyType)
  @IsOptional()
  type?: PropertyType;

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  @IsOptional()
  rooms?: number;

  @ApiPropertyOptional({ example: 75.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  area?: number;

  @ApiPropertyOptional({ example: "Отличная квартира в центре города" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: ["https://example.com/image1.jpg"], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ example: ["Балкон", "Лоджия"], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ enum: PropertyStatus })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;
}
