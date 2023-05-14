import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { VouchersService } from './vouchers.service';
import { Role, Roles } from '@/auth/roles.decorator';
import { AuthGuard } from '@/auth/auth.guard';
import { UserDeco } from '@/auth/auth.decorator';
import { UserPayloadDto } from '@/auth/auth.dto';
import { CampaignDto } from '@/campaigns/campaigns.dto';

@Controller('vouchers')
@ApiTags('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get('')
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
  async list(@UserDeco() userPayload: UserPayloadDto) {
    const data = await this.vouchersService.listUserTicket({
      userId: userPayload.id,
    });

    return {
      data,
    };
  }
}
