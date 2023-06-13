import { v4 as uuid } from 'uuid';
import {
  Body,
  Controller,
  FileTypeValidator,
  ForbiddenException,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompaniesService } from './companies.service';
import {
  CompanyDto,
  CompanyListOptionsDto,
  CompanyUpdateDto,
} from './company.dto';
import { Role, Roles } from '@/auth/roles.decorator';
import { UploadService } from '@/upload/upload.service';
import { AuthGuard } from '@/auth/auth.guard';
import { UserDeco } from '@/auth/auth.decorator';
import { UserPayloadDto } from '@/auth/auth.dto';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List companies' })
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
    name: 'isHaveActiveCampaigns',
    required: false,
    type: Boolean,
  })
  @ApiExtraModels(CompanyDto)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(CompanyDto),
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
  async list(@Query() queryParams: CompanyListOptionsDto) {
    const { limit, page, search, isHaveActiveCampaigns } = queryParams;

    const [currentPage, nextPage] = await Promise.all([
      await this.companiesService.list({
        limit: limit || 10,
        page: page || 1,
        search,
        isHaveActiveCampaigns,
      }),
      await this.companiesService.list({
        limit: limit || 10,
        page: page + 1 || 2,
        search,
        isHaveActiveCampaigns,
      }),
    ]);

    return {
      data: currentPage,
      meta: {
        hasNextPage: nextPage.length > 0,
      },
    };
  }

  @ApiOperation({ summary: 'Get company by id' })
  @ApiExtraModels(CompanyDto)
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(CompanyDto),
        },
      },
    },
  })
  @Get(':id')
  async getById(@Param('id') userId: string) {
    const company = await this.companiesService.findOne({
      id: Number(userId),
    });

    if (!company) {
      throw new NotFoundException();
    }

    return {
      data: company,
    };
  }

  @Patch(':id')
  @Roles(Role.COMPANY)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'update compnay' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      $ref: getSchemaPath(CompanyUpdateDto),
    },
  })
  @ApiExtraModels(CompanyDto, CompanyUpdateDto)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(CompanyDto),
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @UserDeco() userPayload: UserPayloadDto,
    @Body()
    data: CompanyUpdateDto,
    @Param('id') companyId: string,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          // maxSize 2mb
          new MaxFileSizeValidator({ maxSize: 1000 * 1000 * 2 }),
          new FileTypeValidator({
            fileType: 'image/*',
          }),
        ],
      }),
    )
    file: Express.Multer.File | undefined,
  ) {
    let isUpdated = false;
    let uploadedFileName = '';
    try {
      if (userPayload.role !== Role.COMPANY) {
        throw new ForbiddenException('Unauthorized');
      }

      const find = await this.companiesService.findOne({
        id: Number(companyId),
      });

      if (find.id !== userPayload.companyId) {
        throw new ForbiddenException('Unauthorized');
      }

      if (!find) {
        throw new NotFoundException('Company not found');
      }

      if (file && !data.shouldDeletePhoto) {
        const name = `${uuid()}.${file.mimetype.split('/')[1]}`.replace(
          '.svg+xml',
          '.svg',
        );

        await this.uploadService.upload({
          body: file.buffer,
          fileName: name,
          path: 'companies',
          type: file.mimetype,
        });

        uploadedFileName = name;
      }

      const company = await this.companiesService.update({
        id: Number(companyId),
        data: {
          ...data,
          logo: uploadedFileName
            ? uploadedFileName
            : data.shouldDeletePhoto
            ? ''
            : find.logo,
          shouldDeletePhoto: undefined,
          isDeleted: undefined,
          isDisabled: undefined,
        },
      });
      isUpdated = true;
      return {
        data: company,
      };
    } catch (e) {
      if (!isUpdated && uploadedFileName) {
        await this.uploadService.delete({
          fileName: uploadedFileName,
        });
      }
      throw e;
    }
  }
}
