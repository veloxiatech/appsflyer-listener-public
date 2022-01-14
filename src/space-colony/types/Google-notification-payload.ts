export interface GoogleDeveloperNotification {
  message: GoogleDeveloperNotificationMessage;
  subscription: string;
}

export interface GoogleDeveloperNotificationMessage {
  data: string;
  messageId: string;
  message_id: string;
  publishTime: string;
  publish_time: string;
}

export interface GoogleDeveloperNotificationMessageData {
  version: string;
  packageName: string;
  eventTimeMillis: number;
  oneTimeProductNotification?: GoogleOneTimeProductNotification;
  subscriptionNotification?: GoogleSubscriptionNotification;
  testNotification?: GoogleTestNotification;
}

export interface GoogleSubscriptionNotification {
  version: string;
  notificationType: GoogleNotificationTypes;
  purchaseToken: string;
  subscriptionId: string;
}

export interface GoogleOneTimeProductNotification {
  version: string;
  notificationType: number;
  purchaseToken: string;
  sku: string;
}

export interface GoogleTestNotification {
  version: string;
}

export enum GoogleNotificationTypes {
  SUBSCRIPTION_RECOVERED = 1,
  SUBSCRIPTION_RENEWED,
  SUBSCRIPTION_CANCELED,
  SUBSCRIPTION_PURCHASED,
  SUBSCRIPTION_ON_HOLD,
  SUBSCRIPTION_IN_GRACE_PERIOD,
  SUBSCRIPTION_RESTARTED,
  SUBSCRIPTION_PRICE_CHANGE_CONFIRMED,
  SUBSCRIPTION_DEFERRED,
  SUBSCRIPTION_PAUSED,
  SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED,
  SUBSCRIPTION_REVOKED,
  SUBSCRIPTION_EXPIRED,
}
