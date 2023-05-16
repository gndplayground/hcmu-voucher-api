import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { StoresService } from './stores.service';
import {
  StoreCreateDto,
  StoreDto,
  StoreUpdateDto,
  StoresListQueryDto,
} from './stores.dto';
import { Role, Roles } from '@/auth/roles.decorator';
import { AuthGuard } from '@/auth/auth.guard';
import { UserDeco } from '@/auth/auth.decorator';
import { UserPayloadDto } from '@/auth/auth.dto';
import { UserService } from '@/user/user.service';

@Controller('stores')
@ApiTags('stores')
export class StoresController {
  constructor(
    private readonly storeService: StoresService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List store' })
  @ApiExtraModels(StoreDto, StoresListQueryDto)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(StoreDto),
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: Number,
  })
  async list(@Query() query: StoresListQueryDto) {
    const { companyId } = query;

    const stores = await this.storeService.list({
      companyId,
    });

    return {
      data: stores,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Store detail' })
  @ApiExtraModels(StoreDto)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(StoreDto),
        },
      },
    },
  })
  @ApiParam({ name: 'id', type: 'number', description: 'Store ID' })
  async detail(@Param('id') storeId: string) {
    const store = await this.storeService.findOne({
      id: Number(storeId),
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return {
      data: store,
    };
  }

  @Roles(Role.COMPANY)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit store' })
  @ApiExtraModels(StoreDto, StoreUpdateDto)
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(StoreDto),
        },
      },
    },
  })
  @ApiBody({
    type: StoreUpdateDto,
  })
  @ApiParam({ name: 'id', type: 'number', description: 'Store ID' })
  @Patch(':id')
  async update(
    @UserDeco() userPayload: UserPayloadDto,
    @Param('id') storeId: string,
    @Body()
    data: StoreUpdateDto,
  ) {
    const profile = await this.userService.findOneProfile({
      userId: userPayload.id,
    });

    if (!profile || !profile.companyId) {
      throw new ForbiddenException('Profile not found');
    }

    const currentStore = await this.storeService.findOne({
      id: Number(storeId),
      include: {
        company: true,
      },
    });

    if (!currentStore) {
      throw new NotFoundException('Store not found');
    }

    if (currentStore.company.id !== profile.companyId) {
      throw new ForbiddenException('Not owner of this store');
    }

    const store = await this.storeService.update({
      id: Number(storeId),
      data,
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return {
      data: store,
    };
  }

  @Roles(Role.COMPANY)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create store' })
  @ApiExtraModels(StoreDto, StoreCreateDto)
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(StoreDto),
        },
      },
    },
  })
  @ApiBody({
    type: StoreCreateDto,
  })
  @Post('')
  async create(
    @UserDeco() userPayload: UserPayloadDto,
    @Body()
    data: StoreCreateDto,
  ) {
    const profile = await this.userService.findOneProfile({
      userId: userPayload.id,
    });

    if (!profile || !profile.companyId) {
      throw new ForbiddenException('Profile not found');
    }

    const store = await this.storeService.create({
      companyId: profile.companyId,
      data,
    });

    return {
      data: store,
    };
  }
}
