import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST_TOKEN_PAYLOAD_NAME } from '../common/auth.constants.js';

export const TokenPayloadParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const context = ctx.switchToHttp();
    const req: Request = context.getRequest();

    return req[REQUEST_TOKEN_PAYLOAD_NAME];
  },
);
