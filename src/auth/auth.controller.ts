import { Body, Controller, Post } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SuccessAuthDto } from './dto/successAuth.dto';
import { Public } from '../utils/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post()
  @ApiOkResponse({ type: SuccessAuthDto })
  create(@Body() authDto: AuthDto) {
    return this.authService.signIn(authDto);
  }
}
