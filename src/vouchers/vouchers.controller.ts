import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
  ApiQuery,
} from '@nestjs/swagger';
import { VouchersService } from './vouchers.service';
import { VoucherDiscountDto, VouchersnListQueryDto } from './vouchers.dto';
import { Role, Roles } from '@/auth/roles.decorator';
import { AuthGuard } from '@/auth/auth.guard';
import { UserDeco } from '@/auth/auth.decorator';
import { UserPayloadDto } from '@/auth/auth.dto';
import { CampaignDto, CampaignProgressEnum } from '@/campaigns/campaigns.dto';

@Controller('vouchers')
@ApiTags('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get()
  @ApiOperation({ summary: 'List public vouchers' })
  @ApiExtraModels(CampaignDto)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(VoucherDiscountDto),
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
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'filterByProgress',
    required: false,
    enum: Object.values(CampaignProgressEnum),
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: Number,
  })
  async list(@Query() queryParams: VouchersnListQueryDto) {
    const { limit, page, search, filterByProgress, companyId } = queryParams;
    const [currentPage, nextPage] = await Promise.all([
      await this.vouchersService.listDiscount({
        limit: limit || 10,
        page: page || 1,
        search,
        progress: filterByProgress,
        companyId,
      }),
      await this.vouchersService.listDiscount({
        limit: limit || 10,
        page: page + 1 || 2,
        search,
        progress: filterByProgress,
        companyId,
      }),
    ]);
    return {
      data: currentPage,
      meta: {
        hasNextPage: nextPage.length > 0,
      },
    };
  }

  @Get('/me')
  @Roles(Role.USER)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get claimed vouchers (only user)' })
  @ApiExtraModels(CampaignDto)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(CampaignDto),
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
  async claim(@UserDeco() userPayload: UserPayloadDto) {
    const data = await this.vouchersService.listUserTicket({
      userId: userPayload.id,
    });

    return {
      data,
    };
  }
}
