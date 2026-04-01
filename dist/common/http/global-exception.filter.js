"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let GlobalExceptionFilter = class GlobalExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const statusCode = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const exceptionResponse = exception instanceof common_1.HttpException ? exception.getResponse() : null;
        const details = this.extractDetails(exceptionResponse);
        const message = details[0] ??
            this.extractMessage(exceptionResponse) ??
            (exception instanceof Error ? exception.message : null) ??
            'Erro interno do servidor.';
        const payload = {
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
    extractMessage(response) {
        if (typeof response === 'string') {
            return response;
        }
        if (this.isObject(response) && typeof response.message === 'string') {
            return response.message;
        }
        return null;
    }
    extractDetails(response) {
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
    resolveCode(statusCode) {
        const map = {
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
    isObject(value) {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
