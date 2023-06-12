import {
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Role, Roles } from '@/auth/roles.decorator';
import { AuthGuard } from '@/auth/auth.guard';
import { UserDeco } from '@/auth/auth.decorator';
import { UserPayloadDto } from '@/auth/auth.dto';

@ApiTags('dashboard')
@Controller('')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(Role.COMPANY)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    schema: {
      properties: {
        data: {
          type: 'object',
          properties: {
            upcomingCampaigns: { type: 'number' },
            pastCampaigns: { type: 'number' },
            claimedVouchers: { type: 'number' },
            totalVouchers: { type: 'number' },
            totalUserClaims: { type: 'number' },
          },
        },
      },
    },
  })
  async getStats(@UserDeco() userPayload: UserPayloadDto) {
    if (!userPayload.companyId)
      throw new ForbiddenException('User has no company');

    return {
      data: await this.dashboardService.getStats(userPayload.companyId),
    };
  }
}
