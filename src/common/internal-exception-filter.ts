import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';

@Catch()
export class InternalExceptionFilter extends BaseExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status !== HttpStatus.INTERNAL_SERVER_ERROR) {
      super.catch(exception, host);
      return;
    }

    const message = 'Internal error. Please try again later.';
    console.error(exception);
    response.status(status).json({
      statusCode: status,
      message: message,
      detail: {
        message: exception.message,
        stack: exception.stack,
      },
    });
  }
}
