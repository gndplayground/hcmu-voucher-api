import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CampaignsService } from '@/campaigns/campaigns.service';
import { AuthGuard } from '@/auth/auth.guard';
import { Role, Roles } from '@/auth/roles.decorator';

@ApiTags('admin-stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly campService: CampaignsService) {}

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get stats' })
  async stats() {
    const stats = await this.campService.campaignStats();

    return {
      data: stats,
    };
  }
}
