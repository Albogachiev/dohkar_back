import { ApiProperty } from "@nestjs/swagger";
import { IsPhoneNumber, IsString, Length } from "class-validator";

export class RegisterPhonePasswordDto {
  @ApiProperty({
    example: "+79626404047",
    description: "Номер телефона в формате E.164",
  })
  @IsPhoneNumber("RU")
  phone: string;

  @ApiProperty({
    example: "StrongP@ssw0rd",
    description: "Пароль пользователя (минимум 8 символов)",
  })
  @IsString()
  @Length(8, 72)
  password: string;
}
