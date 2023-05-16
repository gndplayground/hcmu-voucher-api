import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
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
import { VoucherQuestionsService } from './voucher-questions.service';
import {
  VoucherQuestionDto,
  VoucherQuestionUpdateDto,
  VoucherQuestionsListQueryDto,
} from './voucher-questions.dto';
import { Role, Roles } from '@/auth/roles.decorator';
import { UserDeco } from '@/auth/auth.decorator';
import { UserPayloadDto } from '@/auth/auth.dto';
import { AuthGuard } from '@/auth/auth.guard';

@Controller('voucher-questions')
@ApiTags('voucher-questions')
export class VoucherQuestionsController {
  userService: any;
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

  @Roles(Role.COMPANY)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'update voucher question' })
  @ApiExtraModels(VoucherQuestionUpdateDto, VoucherQuestionDto)
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(VoucherQuestionDto),
        },
      },
    },
  })
  @ApiBody({
    type: VoucherQuestionUpdateDto,
  })
  @ApiParam({ name: 'id', type: 'number', description: 'Store ID' })
  @Patch(':id')
  async update(
    @UserDeco() userPayload: UserPayloadDto,
    @Param('id') questionId: string,
    @Body()
    data: VoucherQuestionUpdateDto,
  ) {
    const profile = await this.userService.findOneProfile({
      userId: userPayload.id,
    });

    if (!profile || !profile.companyId) {
      throw new ForbiddenException('Profile not found');
    }

    const currentQuestion = await this.voucherQuestionsService.findOne({
      id: Number(questionId),
    });

    if (!currentQuestion) {
      throw new NotFoundException('Question not found');
    }

    const store = await this.voucherQuestionsService.update({
      id: Number(questionId),
      data,
      userCompanyId: profile.companyId,
    });

    return {
      data: store,
    };
  }
}
