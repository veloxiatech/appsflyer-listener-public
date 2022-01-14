import { Body, Controller, Post } from '@nestjs/common';
import { SpaceColonyService } from './space-colony.service';
import { IOSNotificationPayload } from './types/IOS-notification-payload';
import { GoogleDeveloperNotification } from './types/Google-notification-payload';

@Controller('space-colony')
export class SpaceColonyController {
  constructor(private readonly spaceColonyService: SpaceColonyService) {}

  @Post('android')
  async handleAndroidSubscription(@Body() body: GoogleDeveloperNotification) {
    return await this.spaceColonyService.handleAndroidSubscription(body);
  }

  @Post('ios')
  async handleIOSSubscription(@Body() body: IOSNotificationPayload) {
    return await this.spaceColonyService.handleIOSSubscription(body);
  }
}
