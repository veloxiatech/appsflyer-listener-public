import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { IOSNotificationPayload } from './types/IOS-notification-payload';
import { GoogleDeveloperNotification } from './types/Google-notification-payload';

@Injectable()
export class SpaceColonyService {
  constructor(
    @InjectQueue('sc-af-ios') private readonly IOSQueue: Queue,
    @InjectQueue('sc-af-android') private readonly androidQueue: Queue,
  ) {}

  async handleIOSSubscription(body: IOSNotificationPayload) {
    await this.IOSQueue.add(body, {
      attempts: 100,
      backoff: 5000,
    });
  }

  async handleAndroidSubscription(body: GoogleDeveloperNotification) {
    await this.androidQueue.add(body, {
      attempts: 100,
      backoff: 5000,
    });
  }
}
