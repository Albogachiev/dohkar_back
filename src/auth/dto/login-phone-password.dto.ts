import { ApiProperty } from "@nestjs/swagger";
import { IsPhoneNumber, IsString } from "class-validator";

export class LoginPhonePasswordDto {
  @ApiProperty({
    example: "+79626404047",
    description: "Номер телефона в формате E.164",
  })
  @IsPhoneNumber("RU")
  phone: string;

  @ApiProperty({
    example: "StrongP@ssw0rd",
    description: "Пароль пользователя",
  })
  @IsString()
  password: string;
}
