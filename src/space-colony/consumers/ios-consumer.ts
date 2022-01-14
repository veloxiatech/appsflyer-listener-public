import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { IOSNotificationPayload } from '../types/IOS-notification-payload';
import { EventsService } from '../../events/events.service';

@Processor('sc-af-ios')
export class SpaceColonyIOSConsumer {
  constructor(
    @Inject('PG_POOL') private readonly pgPool: Pool,
    private readonly eventsService: EventsService,
  ) {}

  @Process()
  async transcode(job: Job<IOSNotificationPayload>) {
    await this.pgPool.query(
      'INSERT INTO spacecolonydb.public.infra_sub_notif_events (event_source, payload) VALUES ($1, $2)',
      ['APPLE', job.data],
    );

    const { status } = job.data.unified_receipt;

    if (status != '0') {
      throw new Error('This notification is invalid');
    }

    const { notification_type } = job.data;
    const {
      original_transaction_id,
      purchase_date_ms: eventTime,
      product_id,
    } = job.data.unified_receipt.latest_receipt_info[0];

    const subscription = await this.pgPool.query(
      'SELECT u.user_id, idfa, appsflyer_id, price, currency FROM subscriptions_ios JOIN users u on u.user_id = subscriptions_ios.user_id WHERE original_transaction_id=$1',
      [original_transaction_id],
    );

    if (subscription.rows.length > 1) {
      console.log('multiple rows with same purchase token');
    } else if (subscription.rows.length == 0) {
      throw new Error('Subscription not found');
    }

    const { user_id, appsflyer_id, idfa, currency, price } =
      subscription.rows[0];

    if (!appsflyer_id) {
      throw new Error(`Undefined AppsflyerID found for user ${user_id}`);
    }

    switch (notification_type) {
      case 'CANCEL':
        await this.eventsService.sendEvent({
          appsflyer_id,
          customer_user_id: user_id,
          eventName: 'subscription_cancel',
          eventTime,
          eventValue: {
            af_content_id: product_id,
          },
          ...(!!idfa && { advertising_id: idfa }),
        });
        break;
      case 'CONSUMPTION_REQUEST':
        break;
      case 'DID_CHANGE_RENEWAL_PREF':
        break;
      case 'DID_CHANGE_RENEWAL_STATUS':
        break;
      case 'DID_FAIL_TO_RENEW':
        break;
      case 'DID_RECOVER':
        break;
      case 'DID_RENEW':
        await this.eventsService.sendEvent({
          appsflyer_id,
          customer_user_id: user_id,
          eventName: 'subscription_renewal',
          eventTime,
          eventCurrency: currency,
          eventValue: {
            af_revenue: price,
            af_content_id: product_id,
          },
          ...(!!idfa && { advertising_id: idfa }),
        });
        break;
      case 'INITIAL_BUY':
        break;
      case 'INTERACTIVE_RENEWAL':
        break;
      case 'PRICE_INCREASE_CONSENT':
        break;
      case 'REFUND':
        await this.eventsService.sendEvent({
          appsflyer_id,
          customer_user_id: user_id,
          eventName: 'subscription_refund',
          eventTime,
          eventCurrency: currency,
          eventValue: {
            af_revenue: -1 * price,
            af_content_id: product_id,
          },
          ...(!!idfa && { advertising_id: idfa }),
        });
        break;
      case 'REVOKE':
        break;
    }
  }
}
