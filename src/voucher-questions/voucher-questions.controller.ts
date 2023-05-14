import {
  BadRequestException,
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
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { VoucherQuestionsService } from './voucher-questions.service';
import {
  VoucherQuestionDto,
  VoucherQuestionsListQueryDto,
} from './voucher-questions.dto';

@Controller('voucher-questions')
@ApiTags('voucher-questions')
export class VoucherQuestionsController {
  constructor(
    private readonly voucherQuestionsService: VoucherQuestionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List questions' })
  @ApiExtraModels(VoucherQuestionDto, VoucherQuestionsListQueryDto)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(VoucherQuestionDto),
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'campaignId',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'discountId',
    required: false,
    type: Number,
  })
  async list(@Query() query: VoucherQuestionsListQueryDto) {
    const { campaignId, discountId } = query;

    if (!campaignId && !discountId) {
      throw new BadRequestException('campaignId or discountId is required');
    }

    const questions = await this.voucherQuestionsService.list({
      campaignId,
      discountId,
    });

    return {
      data: questions,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Question detail' })
  @ApiExtraModels(VoucherQuestionDto, VoucherQuestionsListQueryDto)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(VoucherQuestionDto),
        },
      },
    },
  })
  @ApiParam({ name: 'id', type: 'number', description: 'Question ID' })
  async detail(@Param('id') questionId: string) {
    const question = await this.voucherQuestionsService.findOne({
      id: Number(questionId),
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return {
      data: question,
    };
  }
}
