import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserPayloadDto } from './auth.dto';

export const UserDeco = createParamDecorator<any, any, UserPayloadDto>(
  (data: any, ctx: ExecutionContext): UserPayloadDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
