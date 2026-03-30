import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from './api-error-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const details = this.extractDetails(exceptionResponse);
    const message =
      details[0] ??
      this.extractMessage(exceptionResponse) ??
      (exception instanceof Error ? exception.message : null) ??
      'Erro interno do servidor.';

    const payload: ApiErrorResponse = {
      success: false,
      error: {
        code: this.resolveCode(statusCode),
        statusCode,
        message,
        details,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(statusCode).json(payload);
  }

  private extractMessage(response: unknown): string | null {
    if (typeof response === 'string') {
      return response;
    }

    if (this.isObject(response) && typeof response.message === 'string') {
      return response.message;
    }

    return null;
  }

  private extractDetails(response: unknown): string[] {
    if (typeof response === 'string') {
      return [response];
    }

    if (Array.isArray(response)) {
      return response.map((item) => String(item)).filter(Boolean);
    }

    if (this.isObject(response)) {
      if (Array.isArray(response.message)) {
        return response.message.map((item) => String(item)).filter(Boolean);
      }

      if (Array.isArray(response.details)) {
        return response.details.map((item) => String(item)).filter(Boolean);
      }

      if (typeof response.message === 'string') {
        return [response.message];
      }
    }

    return [];
  }

  private resolveCode(statusCode: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
    };

    return map[statusCode] ?? 'HTTP_ERROR';
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
