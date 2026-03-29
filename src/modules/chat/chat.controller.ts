import { Body, Controller, Get, MessageEvent, Param, Post, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { ChatService } from './chat.service';

@Controller('Chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  send(@Body() body: SendChatMessageDto) {
    return this.chatService.send(body);
  }

  @Sse('stream/:sessionId')
  stream(@Param('sessionId') sessionId: string): Observable<MessageEvent> {
    return this.chatService.streamSession(sessionId);
  }

  @Post('reset')
  reset(@Body() body: { sessionId: string }) {
    return this.chatService.reset(body.sessionId);
  }

  @Get('sessions')
  sessions() {
    return this.chatService.sessionsList();
  }

  @Get('session/:sessionId/messages')
  messages(@Param('sessionId') sessionId: string) {
    return this.chatService.messages(sessionId);
  }

  @Get('mais-buscadas')
  mostSearched() {
    return this.chatService.keywords();
  }

  @Get('keywords')
  keywords() {
    return this.chatService.keywords();
  }

  @Get('health')
  health() {
    return this.chatService.health();
  }

  @Get('metrics')
  metrics() {
    return this.chatService.metrics();
  }

  @Get('observability')
  observability() {
    return this.chatService.observability();
  }

  @Get('db-status')
  dbStatus() {
    return this.chatService.dbStatus();
  }
}
