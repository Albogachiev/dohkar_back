import { IsEnum, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PropertyStatus } from "@prisma/client";

export class UpdatePropertyStatusDto {
  @ApiProperty({ enum: PropertyStatus })
  @IsEnum(PropertyStatus)
  @IsNotEmpty()
  status: PropertyStatus;
}
