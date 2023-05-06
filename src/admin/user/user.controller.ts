import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto';
import {
  UserCreateDto,
  UserDto,
  UserEditDto,
  UserHideSensitiveDto,
} from '@/user/user.dto';
import { UserService } from '@/user/user.service';
import { AuthService } from '@/auth/auth.service';
import { AuthGuard } from '@/auth/auth.guard';
import { Role, Roles } from '@/auth/roles.decorator';

@ApiTags('admin-users')
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiQuery({ name: 'page', type: 'number', required: true })
  @ApiQuery({ name: 'limit', type: 'number', required: true })
  @ApiQuery({ name: 'search', type: 'string', required: false })
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
        meta: {
          type: 'object',
          properties: {
            hasNextPage: {
              type: 'boolean',
            },
          },
        },
      },
    },
  })
  @Get()
  async getAll(@Query() queryParams: PaginationDto) {
    const { limit, page, search } = queryParams;

    const [currentPage, nextPage] = await Promise.all([
      await this.userService.list({
        limit: limit || 10,
        page: page || 1,
        search,
      }),
      await this.userService.list({
        limit: limit || 10,
        page: page + 1 || 2,
        search,
      }),
    ]);

    return {
      data: currentPage,
      meta: {
        hasNextPage: nextPage.length > 0,
      },
    };
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
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
      password: await this.authService.hashPassword(password),
      role,
    });
    return {
      data: {
        ...user,
        password: undefined,
      },
    };
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get user by id' })
  @ApiExtraModels(UserHideSensitiveDto)
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(UserHideSensitiveDto),
        },
      },
    },
  })
  @Get(':id')
  async getById(@Param('id') userId: string) {
    const user = await this.userService.findOne({
      id: Number(userId),
      hideSensitive: true,
    });

    if (!user) {
      throw new NotFoundException();
    }

    return {
      data: user,
    };
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Edit user' })
  @ApiExtraModels(UserHideSensitiveDto)
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(UserHideSensitiveDto),
        },
      },
    },
  })
  @ApiBody({
    type: UserEditDto,
  })
  @Patch(':id')
  async update(
    @Body()
    data: UserEditDto,
    @Param('id') userId: string,
  ) {
    const user = await this.userService.update({
      id: Number(userId),
      data: {
        ...data,
        password: data.password
          ? await this.authService.hashPassword(data.password)
          : undefined,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return {
      data: {
        ...user,
        password: undefined,
      },
    };
  }
}
