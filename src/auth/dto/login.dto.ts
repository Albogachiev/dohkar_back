import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class LoginDto {
  @ApiPropertyOptional({ example: "+7 (928) 000-00-00" })
  @IsString()
  @IsPhoneNumber('RU')
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @IsNotEmpty()
  password: string;
}
