import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class EventsService {
  constructor(private readonly configService: ConfigService) {}

  getAppsflyerURL = (appId): string =>
    `https://api2.appsflyer.com/inappevent/${appId}`;

  async sendEvent(payload: Record<string, any>) {
    const appsflyerURL = this.getAppsflyerURL(
      this.configService.get<string>('SPACE_COLONY_AF_APP_ID'),
    );

    await axios.post(appsflyerURL, payload, {
      headers: {
        authentication: this.configService.get<string>('APPSFLYER_DEV_KEY'),
      },
    });
  }
}
