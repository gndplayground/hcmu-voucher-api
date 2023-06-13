import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Response,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiBearerAuth,
  ApiOperation,
  ApiExtraModels,
  ApiResponse,
  ApiBody,
  getSchemaPath,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { UserClaimService } from './user-claim.service';
import {
  UserCheckClaimVoucherRequestDto,
  UserClaimQuestionAnswerDto,
  UserClaimVoucherRequestDto,
} from './user-claim.dto';
import { VoucherTicketDto } from '@/vouchers/vouchers.dto';
import { Role, Roles } from '@/auth/roles.decorator';
import { UserPayloadDto } from '@/auth/auth.dto';
import { UserDeco } from '@/auth/auth.decorator';
import { AuthGuard } from '@/auth/auth.guard';
import { PaginationDto } from '@/common/dto';

@Controller('user-claim')
@ApiTags('user-claim')
export class UserClaimController {
  constructor(private readonly userClaimService: UserClaimService) {}

  @Post('/claim')
  @Roles(Role.USER)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'claim voucher (only user)' })
  @ApiExtraModels(UserClaimVoucherRequestDto, UserClaimQuestionAnswerDto)
  @ApiBody({
    schema: {
      $ref: getSchemaPath(UserClaimVoucherRequestDto),
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(VoucherTicketDto),
        },
      },
    },
  })
  async discountClaim(
    @Response({
      passthrough: true,
    })
    res,
    @Body() data: UserClaimVoucherRequestDto,
    @UserDeco() userPayload: UserPayloadDto,
  ) {
    const ticket = await this.userClaimService.claimVoucher({
      userId: userPayload.id,
      voucherDiscountId: data.voucherDiscountId,
      quenstionAnswers: data.quenstionAnswers,
    });

    return {
      data: ticket,
    };
  }

  @Get('/')
  @Roles(Role.USER)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'list voucher claimed' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(VoucherTicketDto),
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
  async listDiscount(
    @UserDeco() userPayload: UserPayloadDto,
    @Query() queryParams: PaginationDto,
  ) {
    const { page } = queryParams;

    const [currentPage, nextPage] = await Promise.all([
      this.userClaimService.getVoucherTickets({
        userId: userPayload.id,
        page: page || 1,
      }),
      this.userClaimService.getVoucherTickets({
        userId: userPayload.id,
        page: page ? page + 1 : 2,
      }),
    ]);
    return {
      data: currentPage,
      meta: {
        hasNextPage: nextPage.length > 0,
      },
    };
  }

  @Get('/can-claim')
  @Roles(Role.USER)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if the user can claim the voucher' })
  @ApiQuery({
    name: 'id',
    required: true,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    schema: {
      properties: {
        data: {
          properties: {
            canClaim: {
              type: 'boolean',
            },
          },
        },
      },
    },
  })
  async checkClaim(
    @UserDeco() userPayload: UserPayloadDto,
    @Query() queryParams: UserCheckClaimVoucherRequestDto,
  ) {
    const result = await this.userClaimService.checkCanClaim({
      userId: userPayload.id,
      voucherDiscountId: Number(queryParams.id),
    });

    return {
      data: result,
    };
  }
}
