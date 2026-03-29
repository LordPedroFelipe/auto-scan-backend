import { Body, Controller, Get, MessageEvent, Param, Post, Sse, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUser } from '../auth/jwt-user.interface';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@Controller('Chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Enviar mensagem para a IA comercial' })
  @Post('send')
  send(@Body() body: SendChatMessageDto) {
    return this.chatService.send(body);
  }

  @ApiOperation({ summary: 'Abrir stream SSE de uma sessao de chat' })
  @Sse('stream/:sessionId')
  stream(@Param('sessionId') sessionId: string): Observable<MessageEvent> {
    return this.chatService.streamSession(sessionId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resetar sessao de chat' })
  @ApiBody({ schema: { type: 'object', properties: { sessionId: { type: 'string' } }, required: ['sessionId'] } })
  @Post('reset')
  @UseGuards(JwtAuthGuard)
  reset(@Body() body: { sessionId: string }, @CurrentUser() user: JwtUser) {
    return this.chatService.reset(body.sessionId, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar sessoes do usuario autenticado' })
  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  sessions(@CurrentUser() user: JwtUser) {
    return this.chatService.sessionsList(user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar mensagens de uma sessao' })
  @Get('session/:sessionId/messages')
  @UseGuards(JwtAuthGuard)
  messages(@Param('sessionId') sessionId: string, @CurrentUser() user: JwtUser) {
    return this.chatService.messages(sessionId, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar palavras mais buscadas pela IA' })
  @Get('mais-buscadas')
  @UseGuards(JwtAuthGuard)
  mostSearched(@CurrentUser() user: JwtUser) {
    return this.chatService.keywords(user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alias para listar keywords do chat' })
  @Get('keywords')
  @UseGuards(JwtAuthGuard)
  keywords(@CurrentUser() user: JwtUser) {
    return this.chatService.keywords(user);
  }

  @ApiOperation({ summary: 'Obter saude do modulo de chat e IA' })
  @Get('health')
  health() {
    return this.chatService.health();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter metricas do modulo de chat' })
  @Get('metrics')
  @UseGuards(JwtAuthGuard)
  metrics(@CurrentUser() user: JwtUser) {
    return this.chatService.metrics(user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter observabilidade consolidada do chat' })
  @Get('observability')
  @UseGuards(JwtAuthGuard)
  observability(@CurrentUser() user: JwtUser) {
    return this.chatService.observability(user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter status do banco usado pelo chat' })
  @Get('db-status')
  @UseGuards(JwtAuthGuard)
  dbStatus() {
    return this.chatService.dbStatus();
  }
}
