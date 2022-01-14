import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SpaceColonyModule } from './space-colony/space-colony.module';
import { BullModule } from '@nestjs/bull';
import { RawDbModule } from './RawDbModule';
import { EventsModule } from './events/events.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: +configService.get<string>('REDIS_PORT'),
        },
      }),
    }),
    RawDbModule,
    SpaceColonyModule,
    EventsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
