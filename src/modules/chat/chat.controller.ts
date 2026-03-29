import { Body, Controller, Get, MessageEvent, Param, Post, Sse, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUser } from '../auth/jwt-user.interface';
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
  @UseGuards(JwtAuthGuard)
  reset(@Body() body: { sessionId: string }, @CurrentUser() user: JwtUser) {
    return this.chatService.reset(body.sessionId, user);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  sessions(@CurrentUser() user: JwtUser) {
    return this.chatService.sessionsList(user);
  }

  @Get('session/:sessionId/messages')
  @UseGuards(JwtAuthGuard)
  messages(@Param('sessionId') sessionId: string, @CurrentUser() user: JwtUser) {
    return this.chatService.messages(sessionId, user);
  }

  @Get('mais-buscadas')
  @UseGuards(JwtAuthGuard)
  mostSearched(@CurrentUser() user: JwtUser) {
    return this.chatService.keywords(user);
  }

  @Get('keywords')
  @UseGuards(JwtAuthGuard)
  keywords(@CurrentUser() user: JwtUser) {
    return this.chatService.keywords(user);
  }

  @Get('health')
  health() {
    return this.chatService.health();
  }

  @Get('metrics')
  @UseGuards(JwtAuthGuard)
  metrics(@CurrentUser() user: JwtUser) {
    return this.chatService.metrics(user);
  }

  @Get('observability')
  @UseGuards(JwtAuthGuard)
  observability(@CurrentUser() user: JwtUser) {
    return this.chatService.observability(user);
  }

  @Get('db-status')
  @UseGuards(JwtAuthGuard)
  dbStatus() {
    return this.chatService.dbStatus();
  }
}
