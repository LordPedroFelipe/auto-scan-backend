"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const send_chat_message_dto_1 = require("./dto/send-chat-message.dto");
const chat_service_1 = require("./chat.service");
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    send(body) {
        return this.chatService.send(body);
    }
    stream(sessionId) {
        return this.chatService.streamSession(sessionId);
    }
    reset(body, user) {
        return this.chatService.reset(body.sessionId, user);
    }
    sessions(user) {
        return this.chatService.sessionsList(user);
    }
    messages(sessionId, user) {
        return this.chatService.messages(sessionId, user);
    }
    mostSearched(user) {
        return this.chatService.keywords(user);
    }
    keywords(user) {
        return this.chatService.keywords(user);
    }
    health() {
        return this.chatService.health();
    }
    metrics(user) {
        return this.chatService.metrics(user);
    }
    observability(user) {
        return this.chatService.observability(user);
    }
    dbStatus() {
        return this.chatService.dbStatus();
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Enviar mensagem para a IA comercial' }),
    (0, common_1.Post)('send'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_chat_message_dto_1.SendChatMessageDto]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "send", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Abrir stream SSE de uma sessao de chat' }),
    (0, common_1.Sse)('stream/:sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", rxjs_1.Observable)
], ChatController.prototype, "stream", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Resetar sessao de chat' }),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { sessionId: { type: 'string' } }, required: ['sessionId'] } }),
    (0, common_1.Post)('reset'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "reset", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar sessoes do usuario autenticado' }),
    (0, common_1.Get)('sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "sessions", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar mensagens de uma sessao' }),
    (0, common_1.Get)('session/:sessionId/messages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "messages", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar palavras mais buscadas pela IA' }),
    (0, common_1.Get)('mais-buscadas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "mostSearched", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Alias para listar keywords do chat' }),
    (0, common_1.Get)('keywords'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "keywords", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter saude do modulo de chat e IA' }),
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "health", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obter metricas do modulo de chat' }),
    (0, common_1.Get)('metrics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "metrics", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obter observabilidade consolidada do chat' }),
    (0, common_1.Get)('observability'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "observability", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obter status do banco usado pelo chat' }),
    (0, common_1.Get)('db-status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "dbStatus", null);
exports.ChatController = ChatController = __decorate([
    (0, swagger_1.ApiTags)('Chat'),
    (0, common_1.Controller)('Chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
