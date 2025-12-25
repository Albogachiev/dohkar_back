import { ApiProperty } from "@nestjs/swagger";
import { PropertyType, Currency, Region, PropertyStatus } from "@prisma/client";

export class PropertyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  price: number;

  @ApiProperty({ enum: Currency })
  currency: Currency;

  @ApiProperty()
  location: string;

  @ApiProperty({ enum: Region })
  region: Region;

  @ApiProperty({ enum: PropertyType })
  type: PropertyType;

  @ApiProperty({ required: false })
  rooms?: number;

  @ApiProperty()
  area: number;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({ type: [String] })
  features: string[];

  @ApiProperty({ enum: PropertyStatus })
  status: PropertyStatus;

  @ApiProperty()
  views: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
