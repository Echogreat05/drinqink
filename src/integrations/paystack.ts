// @ts-nocheck
/**
 * Paystack Integration Module
 * Handles payment initialization, verification, splitting, and refunds
 */

import type {
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyResponse,
  PaymentSplitRequest,
  PaymentSplitResponse,
  RefundRequest,
  RefundResponse,
} from './paystack-types';

/**
 * Get environment variables with proper fallback handling
 */
function getEnv(key: string): string {
  // For client-side code, use import.meta.env (Vite)
  // For server-side code, use process.env
  const clientKey = key.startsWith('VITE_') ? key : `VITE_${key}`;
  const value = typeof import.meta !== 'undefined' 
    ? (import.meta.env as Record<string, string>)[clientKey]
    : process.env[key];
  
  return value || '';
}

/**
 * Get secret key from environment (server-side only)
 */
function getSecretKey(): string {
  const key = typeof process !== 'undefined' ? process.env.PAYSTACK_SECRET_KEY : '';
  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured in environment variables');
  }
  return key;
}

/**
 * Get API base URL
 */
function getApiBaseUrl(): string {
  return getEnv('PAYSTACK_API_BASE_URL') || 'https://api.paystack.co';
}

/**
 * Make authenticated API request to Paystack
 */
async function makeRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, unknown>;
    useSecretKey?: boolean;
  } = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    useSecretKey = true,
  } = options;

  const url = `${getApiBaseUrl()}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (useSecretKey) {
    headers.Authorization = `Bearer ${getSecretKey()}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Paystack API error: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Paystack request failed: ${message}`);
  }
}

/**
 * Initialize a payment and get authorization URL
 * @param request - Payment initialization request details
 * @returns Payment initialization response with authorization URL
 */
export async function initializePayment(
  request: PaymentInitRequest
): Promise<PaymentInitResponse> {
  try {
    if (!request.email || !request.amount) {
      return {
        status: false,
        message: 'Email and amount are required',
        error: 'Missing required fields',
      };
    }

    if (request.amount <= 0) {
      return {
        status: false,
        message: 'Amount must be greater than 0',
        error: 'Invalid amount',
      };
    }

    const payload = {
      reference: request.reference || `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(request.amount * 100), // Convert to kobo
      email: request.email,
      fullname: request.fullName,
      phone: request.phone,
      description: request.description || 'Payment via Drinqink',
      metadata: {
        ...request.metadata,
        ...(request.orderId && { order_id: request.orderId }),
        ...(request.userId && { user_id: request.userId }),
      },
      ...(request.channels && { channels: request.channels }),
      ...(request.currency && { currency: request.currency }),
    };

    const response = await makeRequest<PaymentInitResponse>('/transaction/initialize', {
      method: 'POST',
      body: payload,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment initialization failed';
    return {
      status: false,
      message,
      error: message,
    };
  }
}

/**
 * Verify a payment using transaction reference
 * @param reference - Payment reference to verify
 * @returns Payment verification response with transaction status
 */
export async function verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
  try {
    if (!reference) {
      return {
        status: false,
        message: 'Transaction reference is required',
        error: 'Missing reference',
      };
    }

    const response = await makeRequest<PaymentVerifyResponse>(
      `/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
      }
    );

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment verification failed';
    return {
      status: false,
      message,
      error: message,
    };
  }
}

/**
 * Split payment to multiple vendor accounts
 * @param request - Payment split configuration
 * @returns Payment split response
 */
export async function splitPayment(
  request: PaymentSplitRequest
): Promise<PaymentSplitResponse> {
  try {
    if (!request.reference || !request.splits || request.splits.length === 0) {
      return {
        status: false,
        message: 'Reference and splits configuration are required',
        error: 'Missing required fields',
      };
    }

    // Validate that percentages sum to 100
    const totalPercentage = request.splits.reduce((sum, split) => sum + split.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return {
        status: false,
        message: `Split percentages must sum to 100 (currently: ${totalPercentage})`,
        error: 'Invalid split percentage',
      };
    }

    const payload = {
      reference: request.reference,
      splits: request.splits.map(split => ({
        subaccount: split.subAccountCode,
        share: split.percentage,
        ...(split.description && { description: split.description }),
      })),
    };

    const response = await makeRequest<PaymentSplitResponse>(
      '/transaction/split',
      {
        method: 'POST',
        body: payload,
      }
    );

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment split failed';
    return {
      status: false,
      message,
      error: message,
    };
  }
}

/**
 * Process refund for a payment
 * @param request - Refund request details
 * @returns Refund response
 */
export async function refundPayment(request: RefundRequest): Promise<RefundResponse> {
  try {
    if (!request.reference) {
      return {
        status: false,
        message: 'Transaction reference is required',
        error: 'Missing reference',
      };
    }

    const payload = {
      transaction: request.reference,
      ...(request.amount && { amount: Math.round(request.amount * 100) }), // Convert to kobo
      ...(request.reason && { reason: request.reason }),
      ...(request.deductMessengingFee !== undefined && {
        fully_deducted: request.deductMessengingFee,
      }),
    };

    const response = await makeRequest<RefundResponse>('/refund', {
      method: 'POST',
      body: payload,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Refund processing failed';
    return {
      status: false,
      message,
      error: message,
    };
  }
}

/**
 * Get public key for client-side operations
 */
export function getPublicKey(): string {
  const key = getEnv('PAYSTACK_PUBLIC_KEY');
  if (!key) {
    throw new Error('VITE_PAYSTACK_PUBLIC_KEY is not configured in environment variables');
  }
  return key;
}
