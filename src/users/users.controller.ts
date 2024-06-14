import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/createUser.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from './types/userRole';
import { Roles } from '../utils/roles.decorator';
import { FindAvailableMentorsDto } from './dto/findAvailableMentors.dto';
import { UserDto } from './dto/user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.Admin)
  @Post()
  @ApiOperation({ summary: 'Creates a user' })
  @ApiOkResponse({ type: UserDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    const createdUser = await this.usersService.create(createUserDto);
    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
    };
  }

  @Roles(UserRole.Student)
  @Post('/find-available-mentors')
  @ApiOperation({ summary: 'Finds available mentors for given timeslot' })
  @ApiOkResponse({ type: [UserDto] })
  async findAvailable(
    @Body() findAvailableMentorsDto: FindAvailableMentorsDto,
  ): Promise<UserDto[]> {
    const availableMentors = await this.usersService.findAvailable(
      findAvailableMentorsDto,
    );
    return availableMentors.map((mentor) => ({
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
    }));
  }
}
