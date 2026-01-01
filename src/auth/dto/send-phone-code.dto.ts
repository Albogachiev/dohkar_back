import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SendPhoneCodeDto {
  @ApiProperty({
    example: "+79626404047",
    description: "Номер телефона в формате E.164",
  })
  @IsPhoneNumber('RU')
  @IsString()
  @IsNotEmpty()
  phone: string;
}
