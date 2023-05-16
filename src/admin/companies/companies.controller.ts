import {
  Body,
  Controller,
  FileTypeValidator,
  HttpStatus,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Patch,
  Post,
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
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuid } from 'uuid';
import { CompaniesService } from '@/companies/companies.service';
import {
  CompanyCreateDto,
  CompanyDto,
  CompanyUpdateDto,
} from '@/companies/company.dto';
import { Role, Roles } from '@/auth/roles.decorator';
import { AuthGuard } from '@/auth/auth.guard';
import { UploadService } from '@/upload/upload.service';

@ApiTags('admin-companies')
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create compnay' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      $ref: getSchemaPath(CompanyCreateDto),
    },
  })
  @ApiExtraModels(CompanyDto, CompanyCreateDto)
  @ApiResponse({
    status: HttpStatus.CREATED,
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
  async uploadFile(
    @Body()
    body: CompanyCreateDto,
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
    let isCreated = false;
    let uploadedFileName = '';
    try {
      if (file) {
        const name = `${uuid()}.${file.mimetype.split('/')[1]}`;
        await this.uploadService.upload({
          body: file.buffer,
          fileName: name,
          path: 'companies',
        });
        uploadedFileName = name;
      }

      const company = await this.companiesService.create({
        ...body,
        logo: uploadedFileName,
      });
      isCreated = true;

      return {
        data: company,
      };
    } catch (e) {
      if (!isCreated && uploadedFileName) {
        await this.uploadService.delete({
          fileName: uploadedFileName,
        });
      }
      throw e;
    }
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
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
    @Body()
    data: CompanyUpdateDto,
    @Param('id') companyId: string,
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
    try {
      const find = await this.companiesService.findOne({
        id: Number(companyId),
      });

      if (!find) {
        throw new NotFoundException('Company not found');
      }

      if (file && !data.shouldDeletePhoto) {
        const name = `${uuid()}.${file.mimetype.split('/')[1]}`;

        await this.uploadService.upload({
          body: file.buffer,
          fileName: name,
          path: 'companies',
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
