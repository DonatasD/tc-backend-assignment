import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from './types/userRole';
import { Roles } from '../utils/roles.decorator';
import { FindAvailableMentorsDto } from './dto/findAvailableMentors.dto';
import { UserDto } from './dto/user.dto';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(UserRole.Admin)
  @Post()
  @ApiOperation({ summary: 'Creates a user' })
  @ApiOkResponse({ type: UserDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    const createdUser = await this.userService.create(createUserDto);
    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
    };
  }

  @Roles(UserRole.Student)
  @Get('/available-mentors')
  @ApiOperation({ summary: 'Finds available mentors for given timeslot' })
  @ApiOkResponse({ type: [UserDto] })
  async findAvailableMentors(
    @Query()
    findAvailableMentorsDto: FindAvailableMentorsDto,
  ): Promise<UserDto[]> {
    const availableMentors = await this.userService.findAvailableMentors(
      findAvailableMentorsDto,
    );
    return availableMentors.map((mentor) => ({
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
    }));
  }
}
