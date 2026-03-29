import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { InventorySyncModule } from './modules/inventory-sync/inventory-sync.module';
import { LeadNotesModule } from './modules/lead-notes/lead-notes.module';
import { LeadsModule } from './modules/leads/leads.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { QrCodeModule } from './modules/qrcode/qrcode.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ShopsModule } from './modules/shops/shops.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { TestDrivesModule } from './modules/test-drives/test-drives.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'auto_scan'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AuthModule,
    ChatModule,
    InventorySyncModule,
    LeadNotesModule,
    PermissionsModule,
    QrCodeModule,
    ReportsModule,
    UsersModule,
    ShopsModule,
    SubscriptionsModule,
    VehiclesModule,
    LeadsModule,
    TestDrivesModule,
  ],
})
export class AppModule {}
