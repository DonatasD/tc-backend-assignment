import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({ example: 'test@test.com' })
  email: string;

  @ApiProperty()
  password: string;
}
