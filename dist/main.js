"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const express = __importStar(require("express"));
const fs_1 = require("fs");
const path_1 = require("path");
const global_exception_filter_1 = require("./common/http/global-exception.filter");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const uploadsPath = (0, path_1.join)(process.cwd(), 'uploads');
    (0, fs_1.mkdirSync)((0, path_1.join)(uploadsPath, 'vehicles'), { recursive: true });
    app.setGlobalPrefix('api');
    app.enableCors();
    app.use('/uploads', express.static(uploadsPath));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Auto Scan API')
        .setDescription('API oficial do Auto Scan para autenticacao, operacao comercial, estoque, leads, test drives, QR Codes, cobranca, configuracoes e IA conversacional.')
        .setVersion('0.2.0')
        .addServer('/api', 'Servidor local com prefixo global')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Informe o token JWT no formato Bearer.'
    }, 'bearer')
        .build();
    const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, swaggerConfig, {
        deepScanRoutes: true,
        autoTagControllers: true,
    });
    swagger_1.SwaggerModule.setup('api/docs', app, swaggerDocument, {
        jsonDocumentUrl: 'docs-json',
        yamlDocumentUrl: 'docs-yaml',
        customSiteTitle: 'Auto Scan API Docs',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'none',
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
    });
    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port);
}
bootstrap();
