export type StringBoolean = 'false' | 'true';
export type NumberBoolean = '0' | '1';

export enum ExpirationIntent {
  'VOLUNTARY_CANCELLATION' = '1',
  'BILLING_ERROR' = '2',
  'PRICE_INCREASE' = '3',
  'PRODUCT_UNAVAILABLE' = '4',
  'UNKNOWN_ERROR' = '5',
}

export enum PriceConsentStatus {
  'DISAGREE' = '0',
  'CONSENT' = '1',
}

export type NotificationType =
  | 'CANCEL'
  | 'CONSUMPTION_REQUEST'
  | 'DID_CHANGE_RENEWAL_PREF'
  | 'DID_CHANGE_RENEWAL_STATUS'
  | 'DID_FAIL_TO_RENEW'
  | 'DID_RECOVER'
  | 'DID_RENEW'
  | 'INITIAL_BUY'
  | 'INTERACTIVE_RENEWAL'
  | 'PRICE_INCREASE_CONSENT'
  | 'REFUND'
  | 'REVOKE';

export interface IOSNotificationPayload {
  auto_renew_adam_id: string;
  auto_renew_product_id: string;
  auto_renew_status: StringBoolean;
  auto_renew_status_change_date: string;
  auto_renew_status_change_date_ms: string;
  auto_renew_status_change_date_pst: string;
  bid: string;
  bvrs: string;
  environment: 'Sandbox' | 'PROD';
  expiration_intent?: ExpirationIntent;
  notification_type: NotificationType;
  original_transaction_id?: string | number;
  password: string;
  unified_receipt: IOSUnifiedReceipt;
  latest_receipt: string;
}

export interface IOSUnifiedReceipt {
  environment: 'Production' | 'Sandbox';
  latest_receipt: string;
  latest_receipt_info: [IOSReceiptInfo];
  pending_renewal_info: [IOSPendingRenewalInfo];
  status: string;
}

export interface IOSPendingRenewalInfo {
  auto_renew_product_id: string;
  auto_renew_status: StringBoolean;
  expiration_intent: ExpirationIntent;
  grace_period_expires_date: string;
  grace_period_expires_date_ms: string;
  grace_period_expires_date_pst: string;
  is_in_billing_retry_period: StringBoolean;
  offer_code_ref_name: string;
  original_transaction_id: string;
  price_consent_status: PriceConsentStatus;
  product_id: string;
  promotional_offer_id: string;
}

export interface IOSReceiptInfo {
  // only present in sandbox and when app is supplied an appAccountToken
  app_account_token?: string;

  // cancellation
  cancellation_date?: string;
  cancellation_date_ms?: string;
  cancellation_date_pst?: string;
  cancellation_reason?: '0' | '1';

  expires_date_pst: string;
  expires_date_ms: string;

  in_app_ownership_type: 'PURCHASED' | 'FAMILY_SHARED';
  is_in_intro_offer_period: StringBoolean;
  is_trial_period: StringBoolean;
  is_upgraded?: 'true';

  offer_code_ref_name?: string;

  original_purchase_date: string;
  original_purchase_date_ms: string;
  original_purchase_date_pst: string;
  original_transaction_id: string;

  promotional_offer_id?: string;
  product_id: string;

  purchase_date: string;
  purchase_date_ms: string;
  purchase_date_pst: string;
  transaction_id: string;

  quantity: string;
  subscription_group_identifier: string;
  web_order_line_item_id: string;
  expires_date: string;
}
