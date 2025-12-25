import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  Min,
  ArrayMinSize,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PropertyType, Currency, Region } from "@prisma/client";

export class CreatePropertyDto {
  @ApiProperty({ example: "Квартира в центре Грозного" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 5000000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ enum: Currency, default: Currency.RUB })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @ApiProperty({ example: "г. Грозный, ул. Ленина, д. 10" })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ enum: Region })
  @IsEnum(Region)
  region: Region;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  @IsOptional()
  rooms?: number;

  @ApiProperty({ example: 75.5 })
  @IsNumber()
  @Min(0)
  area: number;

  @ApiProperty({ example: "Отличная квартира в центре города" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: ["https://example.com/image1.jpg"], type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  images: string[];

  @ApiPropertyOptional({ example: ["Балкон", "Лоджия", "Парковка"], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];
}
