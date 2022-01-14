import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { google } from 'googleapis';

import {
  GoogleDeveloperNotification,
  GoogleDeveloperNotificationMessageData,
  GoogleNotificationTypes,
} from '../types/Google-notification-payload';
import { EventsService } from '../../events/events.service';

@Processor('sc-af-android')
export class SpaceColonyAndroidConsumer {
  constructor(
    @Inject('PG_POOL') private readonly pgPool: Pool,
    private readonly eventsService: EventsService,
  ) {}

  @Process()
  async transcode(job: Job<GoogleDeveloperNotification>) {
    await this.pgPool.query(
      'INSERT INTO spacecolonydb.public.infra_sub_notif_events (event_source, payload) VALUES ($1, $2)',
      ['GOOGLE', job.data],
    );

    const decodedData: GoogleDeveloperNotificationMessageData = JSON.parse(
      Buffer.from(job.data.message.data, 'base64').toString('utf-8'),
    ) as unknown as GoogleDeveloperNotificationMessageData;

    const {
      packageName,
      eventTimeMillis: eventTime,
      subscriptionNotification: {
        subscriptionId,
        purchaseToken: token,
        notificationType,
      },
    } = decodedData;

    const androidpublisher = google.androidpublisher('v3');

    const {
      data: {
        linkedPurchaseToken,
        introductoryPriceInfo: {
          introductoryPriceCurrencyCode,
          introductoryPriceAmountMicros,
        },
      },
    } = await androidpublisher.purchases.subscriptions.get({
      packageName,
      subscriptionId,
      token,
    });

    const subscription = await this.pgPool.query(
      'SELECT u.user_id, gaid, appsflyer_id FROM subscriptions_android JOIN users u on u.user_id = subscriptions_android.user_id WHERE purchase_token=$1',
      [linkedPurchaseToken],
    );

    if (subscription.rows.length > 1) {
      console.log('multiple rows with same purchase token');
    } else if (subscription.rows.length == 0) {
      throw new Error('Subscription not found');
    }

    const { user_id, appsflyer_id, gaid } = subscription.rows[0];

    if (!appsflyer_id) {
      throw new Error(`Undefined AppsflyerID found for user ${user_id}`);
    }

    switch (notificationType) {
      case GoogleNotificationTypes.SUBSCRIPTION_RECOVERED:
        break;
      case GoogleNotificationTypes.SUBSCRIPTION_RENEWED:
        await this.eventsService.sendEvent({
          appsflyer_id,
          customer_user_id: user_id,
          eventName: 'subscription_renewal',
          eventTime,
          eventCurrency: introductoryPriceCurrencyCode,
          eventValue: {
            af_revenue: parseInt(introductoryPriceAmountMicros) * 0.000001,
            af_content_id: subscriptionId,
          },
          ...(!!gaid && { advertising_id: gaid }),
        });
        break;
      case GoogleNotificationTypes.SUBSCRIPTION_CANCELED:
        await this.eventsService.sendEvent({
          appsflyer_id,
          customer_user_id: user_id,
          eventName: 'subscription_cancel',
          eventTime,
          eventValue: {
            af_content_id: subscriptionId,
          },
          ...(!!gaid && { advertising_id: gaid }),
        });
        break;
      case GoogleNotificationTypes.SUBSCRIPTION_PURCHASED:
        break;
      case GoogleNotificationTypes.SUBSCRIPTION_ON_HOLD:
        break;
      case GoogleNotificationTypes.SUBSCRIPTION_IN_GRACE_PERIOD:
        break;
      case GoogleNotificationTypes.SUBSCRIPTION_RESTARTED:
        break;
      case GoogleNotificationTypes.SUBSCRIPTION_PRICE_CHANGE_CONFIRMED:
        break;
      case GoogleNotificationTypes.SUBSCRIPTION_DEFERRED:
        break;
      case GoogleNotificationTypes.SUBSCRIPTION_PAUSED:
        break;
      case GoogleNotificationTypes.SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED:
        break;
      case GoogleNotificationTypes.SUBSCRIPTION_REVOKED:
        await this.eventsService.sendEvent({
          appsflyer_id,
          customer_user_id: user_id,
          eventName: 'subscription_refund',
          eventTime,
          eventCurrency: introductoryPriceCurrencyCode,
          eventValue: {
            af_revenue: parseInt(introductoryPriceAmountMicros) * -0.000001,
            af_content_id: subscriptionId,
          },
          ...(!!gaid && { advertising_id: gaid }),
        });
        break;
      case GoogleNotificationTypes.SUBSCRIPTION_EXPIRED:
        break;
    }
  }
}
