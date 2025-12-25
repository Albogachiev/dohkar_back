import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email?: string;

  @ApiProperty({ example: "John Doe" })
  @IsString()
  name?: string;

  @ApiProperty({ example: "password123", minLength: 6 })
  @IsString()
  @MinLength(6)
  password?: string;

   @ApiPropertyOptional({ example: "+7 (928) 000-00-00" })
  @IsString()
  @IsPhoneNumber('RU')
  @IsNotEmpty()
  phone: string;
}
