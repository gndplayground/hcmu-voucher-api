import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
  ApiConsumes,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { v4 as uuid } from 'uuid';
import { FileInterceptor } from '@nestjs/platform-express';
import { CampaignsService } from './campaigns.service';
import {
  CampaignCreateFullDto,
  CampaignDto,
  CampaignListQueryDto,
  CampaignProgressEnum,
  CampaignUpdateDto,
} from './campaigns.dto';
import { UploadService } from '@/upload/upload.service';
import { AuthGuard } from '@/auth/auth.guard';
import { Role, Roles } from '@/auth/roles.decorator';
import { UserDeco } from '@/auth/auth.decorator';
import { UserPayloadDto } from '@/auth/auth.dto';
import {
  VoucherDiscountCreateWithCampaignDto,
  VoucherDiscountDto,
  VoucherDiscountUpdateDto,
} from '@/vouchers/vouchers.dto';
import { UserService } from '@/user/user.service';
import { VouchersService } from '@/vouchers/vouchers.service';

@Controller('campagins')
@ApiTags('campagins')
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly uploadService: UploadService,
    private readonly voucherService: VouchersService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List public campaigns' })
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
  async list(@Query() queryParams: CampaignListQueryDto) {
    const { limit, page, search, filterByProgress } = queryParams;
    const [currentPage, nextPage] = await Promise.all([
      await this.campaignsService.list({
        limit: limit || 10,
        page: page || 1,
        search,
        progress: filterByProgress,
      }),
      await this.campaignsService.list({
        limit: limit || 10,
        page: page + 1 || 2,
        search,
        progress: filterByProgress,
      }),
    ]);
    return {
      data: currentPage,
      meta: {
        hasNextPage: nextPage.length > 0,
      },
    };
  }

  @Get('/:id/discounts')
  @ApiOperation({ summary: 'List voucher discounts' })
  @ApiExtraModels(VoucherDiscountDto)
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
  async listDiscount(@Param('id') campId: string) {
    const find = await this.campaignsService.findOne({
      id: Number(campId),
    });

    if (!find) {
      throw new NotFoundException('Campaign not found');
    }

    const discounts = await this.voucherService.listDiscount({
      campaignId: Number(campId),
    });
    return {
      data: discounts,
    };
  }

  @Get('/:id/discounts/:discountId')
  @ApiOperation({ summary: 'Voucher discount detail' })
  @ApiExtraModels(VoucherDiscountDto)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(VoucherDiscountDto),
        },
      },
    },
  })
  @ApiParam({ name: 'id', type: 'number', description: 'Campaign ID' })
  @ApiParam({ name: 'discountId', type: 'number', description: 'Discount ID' })
  async discountDetail(@Param('id') campId: string) {
    const find = await this.campaignsService.findOne({
      id: Number(campId),
    });

    if (!find) {
      throw new NotFoundException('Campaign not found');
    }

    const discounts = await this.voucherService.listDiscount({
      campaignId: Number(campId),
    });

    return {
      data: discounts,
    };
  }

  @Roles(Role.COMPANY)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @Patch('/:id/discounts/:discountId')
  @ApiOperation({ summary: 'update voucher discount' })
  @ApiExtraModels(VoucherDiscountUpdateDto)
  @ApiBody({
    schema: {
      $ref: getSchemaPath(VoucherDiscountUpdateDto),
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Success',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(VoucherDiscountUpdateDto),
        },
      },
    },
  })
  async updateDiscount(
    @Body()
    data: VoucherDiscountUpdateDto,
    @Param('id') campId: string,
    @Param('discountId') discountId: string,
  ) {
    const find = await this.campaignsService.findOne({
      id: Number(campId),
    });

    if (!find) {
      throw new NotFoundException('Campaign not found');
    }

    const discount = await this.voucherService.findOneDiscount({
      id: Number(discountId),
    });

    if (!discount) {
      throw new NotFoundException('Campaign not found');
    }

    const discountUpdated = await this.voucherService.updateDiscount({
      id: Number(discountId),
      data,
    });

    return {
      data: discountUpdated,
    };
  }

  @Patch(':id')
  @Roles(Role.COMPANY)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update campaign' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      $ref: getSchemaPath(CampaignUpdateDto),
    },
  })
  @ApiExtraModels(CampaignDto, CampaignUpdateDto)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(CampaignDto),
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @Body()
    data: CampaignUpdateDto,
    @Param('id') campId: string,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          // maxSize 2mb
          new MaxFileSizeValidator({ maxSize: 1000 * 1000 * 2 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File | undefined,
  ) {
    let isUpdated = false;
    let uploadedFileName = '';
    let deletedFileName = '';
    try {
      const find = await this.campaignsService.findOne({
        id: Number(campId),
      });

      if (!find) {
        throw new NotFoundException('Campaign not found');
      }

      if (file && !data.shouldDeletePhoto) {
        const name = `${uuid()}.${file.mimetype.split('/')[1]}`;

        await this.uploadService.upload({
          body: file.buffer,
          fileName: name,
          path: 'campaigns',
        });
        uploadedFileName = name;
      }

      const campaign = await this.campaignsService.update({
        id: Number(campId),
        data: {
          ...data,
          logo: uploadedFileName
            ? uploadedFileName
            : data.shouldDeletePhoto
            ? ''
            : find.logo,
          shouldDeletePhoto: undefined,
        },
      });
      isUpdated = true;
      deletedFileName = find.logo;
      return {
        data: campaign,
      };
    } catch (e) {
      if (!isUpdated && uploadedFileName) {
        await this.uploadService.delete({
          fileName: uploadedFileName,
          path: 'campaigns',
        });
      }
      throw e;
    } finally {
      if (deletedFileName) {
        try {
          await this.uploadService.delete({
            fileName: deletedFileName,
            path: 'campaigns',
          });
        } catch (e) {
          // Should send notification
          console.log('Failed remove', e);
        }
      }
    }
  }

  @Post('')
  @Roles(Role.COMPANY)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create campaign' })
  @ApiBody({
    schema: {
      $ref: getSchemaPath(CampaignCreateFullDto),
    },
  })
  @ApiExtraModels(
    CampaignDto,
    CampaignCreateFullDto,
    VoucherDiscountCreateWithCampaignDto,
  )
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Success',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(CampaignDto),
        },
      },
    },
  })
  async create(
    @UserDeco() userPayload: UserPayloadDto,
    @Body()
    body: CampaignCreateFullDto,
  ) {
    const profile = await this.userService.findOneProfile({
      userId: userPayload.id,
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const { voucherDiscounts, ...campaign } = body;

    const c = await this.campaignsService.createFull({
      campaign: {
        ...campaign,
      },
      companyId: profile.companyId,
      createdBy: userPayload.id,
      discounts: voucherDiscounts,
    });

    return {
      data: c,
    };
  }
}
