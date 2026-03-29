import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadEntity } from '../leads/entities/lead.entity';
import { ShopEntity } from '../shops/entities/shop.entity';
import { TestDriveEntity } from '../test-drives/entities/test-drive.entity';
import { UserEntity } from '../users/entities/user.entity';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatMessageEntity } from './entities/chat-message.entity';
import { ChatSessionEntity } from './entities/chat-session.entity';
import { ChatTelemetryEventEntity } from './entities/chat-telemetry-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShopEntity,
      VehicleEntity,
      LeadEntity,
      UserEntity,
      TestDriveEntity,
      ChatSessionEntity,
      ChatMessageEntity,
      ChatTelemetryEventEntity,
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
