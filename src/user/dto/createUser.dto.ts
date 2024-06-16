import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../types/userRole';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  constructor(createUserDto: Partial<CreateUserDto>) {
    Object.assign(this, createUserDto);
  }

  @ApiProperty({ example: 'name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'test@test.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.Student })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: 'password' })
  @IsNotEmpty()
  password: string;
}
