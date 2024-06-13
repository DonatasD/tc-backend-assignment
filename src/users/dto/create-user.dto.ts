import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../types/userRole';

export class CreateUserDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ example: 'test@test.com' })
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  password: string;
}
