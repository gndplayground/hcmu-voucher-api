import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { UserCreateDto } from './dto';
import { PaginationDto } from '@/common/dto';
import { UserDto } from '@/user/user.dto';
import { UserService } from '@/user/user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiQuery({ name: 'page', type: 'number', required: true })
  @ApiQuery({ name: 'limit', type: 'number', required: true })
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiExtraModels(UserDto)
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(UserDto),
          },
        },
      },
    },
  })
  @Get()
  async getAll(@Query() queryParams: PaginationDto) {
    const { limit, page } = queryParams;
    return {
      data: await this.userService.list({
        limit: limit || 10,
        page: page || 1,
      }),
    };
  }

  @ApiOperation({ summary: 'Create new users' })
  @ApiExtraModels(UserDto)
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(UserDto),
        },
      },
    },
  })
  @ApiBody({
    type: UserCreateDto,
  })
  @Post()
  @HttpCode(201)
  async create(
    @Body()
    { email, password, role }: UserCreateDto,
  ) {
    const user = await this.userService.create({
      email,
      password,
      role,
    });
    return {
      data: {
        ...user,
        password: undefined,
      },
    };
  }
}
