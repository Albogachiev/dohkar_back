import { ApiProperty } from "@nestjs/swagger";
import { PropertyResponseDto } from "../../properties/dto/property-response.dto";

export class FavoriteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: PropertyResponseDto })
  property: PropertyResponseDto;
}
