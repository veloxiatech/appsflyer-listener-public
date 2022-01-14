import { Module } from '@nestjs/common';
import { SpaceColonyService } from './space-colony.service';
import { SpaceColonyController } from './space-colony.controller';
import { SpaceColonyAndroidConsumer } from './consumers/android-consumer';
import { SpaceColonyIOSConsumer } from './consumers/ios-consumer';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { RawDbModule } from '../RawDbModule';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'sc-af-android',
      },
      {
        name: 'sc-af-ios',
      },
    ),
    ConfigModule,
    RawDbModule,
    EventsModule,
  ],
  controllers: [SpaceColonyController],
  providers: [
    SpaceColonyService,
    SpaceColonyAndroidConsumer,
    SpaceColonyIOSConsumer,
  ],
})
export class SpaceColonyModule {}
