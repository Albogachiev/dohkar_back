import { ApiProperty } from "@nestjs/swagger";
import { IsPhoneNumber, IsString, Length } from "class-validator";

export class VerifyPhoneCodeDto {
   @ApiProperty({
    example: "+79626404047",
    description: "Номер телефона в формате E.164",
  })
  @IsPhoneNumber("RU")
  phone: string;

  @ApiProperty({ example: "379840", description: "Код из SMS" })
  @IsString()
  @Length(4, 6)
  code: string;
}
