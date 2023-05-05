import { error } from 'console';
import {
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Observable, lastValueFrom } from 'rxjs';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest<TUser = any>(err: any, user: any, info: any): TUser {
    if (err || !user) {
      if (
        info instanceof TokenExpiredError ||
        error instanceof TokenExpiredError
      ) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Token expired',
          error: 'Unauthorized',
          jwt: {
            isExpired: true,
          },
        });
      }
      throw err || new UnauthorizedException();
    }
    return user;
  }

  async canActivate(context: ExecutionContext) {
    const superCanActive = super.canActivate(context);

    let superCanActiveResult = false;

    if (superCanActive instanceof Promise) {
      superCanActiveResult = await superCanActive;
    } else if (superCanActive instanceof Observable) {
      superCanActiveResult = await lastValueFrom(superCanActive);
    } else {
      superCanActiveResult = superCanActive;
    }

    const user = context.switchToHttp().getRequest().user;

    if (!superCanActiveResult) {
      return false;
    }

    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    return requiredRoles.indexOf(user.role) !== -1;
  }
}
