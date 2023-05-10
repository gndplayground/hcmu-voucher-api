import {
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CompanyDto } from './company.dto';
import { PaginationDto } from '@/common/dto';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

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
  async list(@Query() queryParams: PaginationDto) {
    const { limit, page, search } = queryParams;

    const [currentPage, nextPage] = await Promise.all([
      await this.companiesService.list({
        limit: limit || 10,
        page: page || 1,
        search,
      }),
      await this.companiesService.list({
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
}
