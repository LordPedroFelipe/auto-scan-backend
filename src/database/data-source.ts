import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ChatMessageEntity } from '../modules/chat/entities/chat-message.entity';
import { ChatSessionEntity } from '../modules/chat/entities/chat-session.entity';
import { ChatTelemetryEventEntity } from '../modules/chat/entities/chat-telemetry-event.entity';
import { LeadNoteEntity } from '../modules/lead-notes/entities/lead-note.entity';
import { LeadEntity } from '../modules/leads/entities/lead.entity';
import { QrCodeEntity } from '../modules/qrcode/entities/qr-code.entity';
import { ShopEntity } from '../modules/shops/entities/shop.entity';
import { SubscriptionPaymentEntity } from '../modules/subscriptions/entities/subscription-payment.entity';
import { SubscriptionEntity } from '../modules/subscriptions/entities/subscription.entity';
import { TestDriveEntity } from '../modules/test-drives/entities/test-drive.entity';
import { UserEntity } from '../modules/users/entities/user.entity';
import { VehicleEntity } from '../modules/vehicles/entities/vehicle.entity';
import { KafkaBootstrap1743300000000 } from './migrations/1743300000000-KafkaBootstrap';
import { ChatAiUpgrade1743320000000 } from './migrations/1743320000000-ChatAiUpgrade';
import { VehiclePhotoVariants1743311000000 } from './migrations/1743311000000-VehiclePhotoVariants';
import { PlatformAdminBootstrap1743330000000 } from './migrations/1743330000000-PlatformAdminBootstrap';
import { ShopSettingsPreferences1743340000000 } from './migrations/1743340000000-ShopSettingsPreferences';
import { BillingProductionReadiness1743350000000 } from './migrations/1743350000000-BillingProductionReadiness';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'auto_scan',
  synchronize: false,
  entities: [
    UserEntity,
    ChatSessionEntity,
    ChatMessageEntity,
    ChatTelemetryEventEntity,
    ShopEntity,
    VehicleEntity,
    LeadEntity,
    TestDriveEntity,
    LeadNoteEntity,
    QrCodeEntity,
    SubscriptionEntity,
    SubscriptionPaymentEntity,
  ],
  migrations: [
    KafkaBootstrap1743300000000,
    VehiclePhotoVariants1743311000000,
    ChatAiUpgrade1743320000000,
    PlatformAdminBootstrap1743330000000,
    ShopSettingsPreferences1743340000000,
    BillingProductionReadiness1743350000000,
  ],
});
