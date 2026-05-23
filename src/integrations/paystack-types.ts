// @ts-nocheck
/**
 * Paystack Integration Type Definitions
 */

/**
 * Request payload for initializing a payment
 */
export interface PaymentInitRequest {
  amount: number;
  email: string;
  fullName: string;
  phone?: string;
  description?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
  channels?: Array<'card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer'>;
  currency?: string;
  orderId?: string;
  userId?: string;
}

/**
 * Response from initializing a payment
 */
export interface PaymentInitResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
  error?: string;
}

/**
 * Response from verifying a payment
 */
export interface PaymentVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    status: 'success' | 'failed' | 'pending';
    authorization?: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
    };
    customer?: {
      id: number;
      first_name?: string;
      last_name?: string;
      email: string;
      phone?: string;
    };
    paid_at?: string;
    created_at?: string;
    metadata?: Record<string, unknown>;
  };
  error?: string;
}

/**
 * Configuration for splitting payment to multiple accounts
 */
export interface SplitConfig {
  subAccountCode: string;
  percentage: number;
  description?: string;
}

/**
 * Request payload for payment split
 */
export interface PaymentSplitRequest {
  reference: string;
  splits: SplitConfig[];
}

/**
 * Response from payment split operation
 */
export interface PaymentSplitResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    name: string;
    type: string;
    currency: string;
    domain: string;
    splits?: Array<{
      id: number;
      name: string;
      slug: string;
      percentage: number;
      subaccount_id?: number;
      share?: number;
    }>;
  };
  error?: string;
}

/**
 * Request payload for processing refunds
 */
export interface RefundRequest {
  reference: string;
  amount?: number;
  reason?: string;
  deductMessengingFee?: boolean;
}

/**
 * Response from refund operation
 */
export interface RefundResponse {
  status: boolean;
  message: string;
  data?: {
    reference: string;
    amount: number;
    currency: string;
    deducted_amount: number;
    fully_deducted: boolean;
    status: 'pending' | 'approved' | 'rejected' | 'processing';
    refund_reference?: string;
  };
  error?: string;
}

/**
 * Webhook payload from Paystack
 */
export interface PaystackWebhookPayload {
  event: 'charge.success' | 'charge.failed' | 'charge.dispute' | 'transfer.success' | 'transfer.failed';
  data: Record<string, unknown>;
}

/**
 * Paystack error response
 */
export interface PaystackError {
  status: false;
  message: string;
  error?: string;
}

/**
 * Hook state for payment operations
 */
export interface PaymentState {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: unknown;
}
