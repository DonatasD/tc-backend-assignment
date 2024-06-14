import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty } from 'class-validator';

export class UserDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty({ example: 'name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'test@test.com' })
  @IsEmail()
  email: string;
}
