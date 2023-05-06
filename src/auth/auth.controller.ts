import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Request,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto, UserPayloadDto } from './auth.dto';
import { RefreshGuard } from './refresh.guard';
import { UserDeco } from './auth.decorator';
import { AuthGuard } from './auth.guard';
import { AppConfig } from '@/common/config';
import { AppRequest, AppResponse } from '@/common/types/app';
import { UserDto } from '@/user/user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService<AppConfig>,
  ) {}

  @ApiTags('auth')
  @ApiOperation({ summary: 'Login cookie' })
  @ApiOkResponse({ description: 'Login success' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Response({
      passthrough: true,
    })
    res: AppResponse,
  ) {
    const result = await this.authService.login(loginDto);

    if (!result) {
      throw new UnauthorizedException();
    }

    const { token, user } = result;

    res.cookie('token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });

    return {
      data: {
        user,
      },
    };
  }

  @ApiTags('auth')
  @ApiOperation({ summary: 'Login stateless' })
  @ApiExtraModels(UserDto)
  @ApiOkResponse({
    description: 'Login success',
    schema: {
      properties: {
        data: {
          properties: {
            token: {
              type: 'string',
            },
            user: {
              $ref: getSchemaPath(UserDto),
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('login-stateless')
  async loginStateless(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);

    if (!result) {
      throw new UnauthorizedException();
    }

    const { token, user } = result;

    return {
      data: {
        token,
        user,
      },
    };
  }

  @UseGuards(RefreshGuard)
  @ApiTags('auth')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiOkResponse({ description: 'Refresh token success' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('refresh-token')
  async refreshToken(
    @UserDeco() userPayload: UserPayloadDto,
    @Request() req: AppRequest,
    @Response({
      passthrough: true,
    })
    res: AppResponse,
  ) {
    const result = await this.authService.refresh(userPayload);

    if (!result) {
      throw new UnauthorizedException();
    }

    const { token, user } = result;

    if (req.cookies && 'token' in req.cookies) {
      res.cookie('token', token, {
        httpOnly: true,
        // 30 days
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      });
    }

    return {
      data: {
        token,
        user,
      },
    };
  }

  @UseGuards(AuthGuard)
  @ApiTags('auth')
  @ApiOperation({ summary: 'Logout' })
  @ApiOkResponse({
    description: 'Logout success',
    status: HttpStatus.NO_CONTENT,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('logout')
  async logout(
    @Response({
      passthrough: true,
    })
    res: AppResponse,
  ) {
    res.clearCookie('token').status(HttpStatus.NO_CONTENT);
  }
}
