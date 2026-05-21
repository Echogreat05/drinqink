# Paystack Payment Integration Guide

This document provides a comprehensive guide for using the Paystack payment integration in the Drinqink application.

## Overview

The Paystack integration module provides the following functionality:
- **Payment Initialization**: Create a payment request and get a payment authorization URL
- **Payment Verification**: Verify if a payment was successful using a transaction reference
- **Payment Splitting**: Distribute payments to multiple vendor accounts
- **Refund Processing**: Process refunds for rejected or disputed orders
- **React Hooks**: Easy-to-use React hooks for managing payment state and operations

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env.local` file (never commit this file):

```bash
# Public key for client-side operations (can be exposed in frontend)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key  # Production

# Secret key for server-side operations (NEVER expose in frontend)
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key  # Production

# Paystack API base URL (usually https://api.paystack.co)
VITE_PAYSTACK_API_BASE_URL=https://api.paystack.co

# Webhook signing secret
PAYSTACK_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 2. Get Your Paystack Credentials

1. Create an account at [Paystack](https://paystack.com)
2. Go to Settings → API Keys & Webhooks
3. Copy your **Public Key** and **Secret Key**
4. Add them to your `.env.local` file

## File Structure

```
src/
├── integrations/
│   ├── paystack.ts           # Main integration module
│   ├── paystack-types.ts     # TypeScript type definitions
│   └── supabase/             # Other integrations
├── hooks/
│   ├── use-paystack.ts       # React hooks for Paystack
│   └── use-mobile.tsx        # Other hooks
└── ...
```

## API Reference

### Integration Module (`src/integrations/paystack.ts`)

#### `initializePayment(request: PaymentInitRequest): Promise<PaymentInitResponse>`

Initialize a payment and get a payment authorization URL.

**Parameters:**
```typescript
interface PaymentInitRequest {
  amount: number;              // Amount in the base currency unit
  email: string;               // Customer email
  fullName: string;            // Customer full name
  phone?: string;              // Customer phone number
  description?: string;        // Payment description (default: "Payment via Drinqink")
  reference?: string;          // Unique transaction reference (auto-generated if not provided)
  metadata?: Record<string, unknown>;  // Additional metadata
  channels?: string[];         // Payment channels: 'card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'
  currency?: string;           // Currency code (default: 'NGN')
  orderId?: string;            // Associated order ID
  userId?: string;             // Associated user ID
}
```

**Returns:**
```typescript
interface PaymentInitResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;  // URL to redirect user to
    access_code: string;        // Access code for the payment
    reference: string;          // Transaction reference
  };
  error?: string;
}
```

**Example:**
```typescript
import { initializePayment } from '@/integrations/paystack';

const response = await initializePayment({
  amount: 5000,
  email: 'customer@example.com',
  fullName: 'John Doe',
  phone: '+2348012345678',
  description: 'Order #12345',
  metadata: {
    order_id: '12345',
    vendor_id: 'vendor_001'
  }
});

if (response.status && response.data) {
  window.location.href = response.data.authorization_url;
}
```

#### `verifyPayment(reference: string): Promise<PaymentVerifyResponse>`

Verify if a payment was successful using a transaction reference.

**Parameters:**
- `reference` (string): Transaction reference to verify

**Returns:**
```typescript
interface PaymentVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    reference: string;
    amount: number;              // Amount in kobo
    currency: string;
    status: 'success' | 'failed' | 'pending';
    authorization?: {
      authorization_code: string;
      bin: string;
      last4: string;
      channel: string;
      card_type: string;
      bank: string;
    };
    customer?: {
      id: number;
      email: string;
      phone?: string;
    };
    paid_at?: string;
    created_at?: string;
    metadata?: Record<string, unknown>;
  };
  error?: string;
}
```

**Example:**
```typescript
import { verifyPayment } from '@/integrations/paystack';

const response = await verifyPayment('ref_1234567890');

if (response.status && response.data?.status === 'success') {
  console.log('Payment successful!');
  console.log('Amount:', response.data.amount / 100); // Convert from kobo to naira
}
```

#### `splitPayment(request: PaymentSplitRequest): Promise<PaymentSplitResponse>`

Split a payment to multiple vendor accounts. Useful for marketplace scenarios where multiple vendors need to receive portions of a payment.

**Parameters:**
```typescript
interface PaymentSplitRequest {
  reference: string;  // Transaction reference
  splits: Array<{
    subAccountCode: string;   // Paystack subaccount code
    percentage: number;       // Percentage of payment (must sum to 100)
    description?: string;
  }>;
}
```

**Returns:**
```typescript
interface PaymentSplitResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    name: string;
    splits?: Array<{
      id: number;
      name: string;
      percentage: number;
      share?: number;
    }>;
  };
  error?: string;
}
```

**Example:**
```typescript
import { splitPayment } from '@/integrations/paystack';

const response = await splitPayment({
  reference: 'ref_1234567890',
  splits: [
    {
      subAccountCode: 'ACCT_abc123',
      percentage: 70,
      description: 'Vendor A'
    },
    {
      subAccountCode: 'ACCT_def456',
      percentage: 30,
      description: 'Vendor B'
    }
  ]
});
```

#### `refundPayment(request: RefundRequest): Promise<RefundResponse>`

Process a refund for a payment.

**Parameters:**
```typescript
interface RefundRequest {
  reference: string;            // Transaction reference to refund
  amount?: number;              // Amount to refund (in base currency, not kobo)
  reason?: string;              // Reason for refund
  deductMessengingFee?: boolean; // Whether to deduct messaging fees
}
```

**Returns:**
```typescript
interface RefundResponse {
  status: boolean;
  message: string;
  data?: {
    reference: string;
    amount: number;
    currency: string;
    deducted_amount: number;
    fully_deducted: boolean;
    status: 'pending' | 'approved' | 'rejected' | 'processing';
  };
  error?: string;
}
```

**Example:**
```typescript
import { refundPayment } from '@/integrations/paystack';

const response = await refundPayment({
  reference: 'ref_1234567890',
  amount: 5000,
  reason: 'Order cancelled'
});

if (response.status) {
  console.log('Refund initiated:', response.data?.status);
}
```

### React Hooks (`src/hooks/use-paystack.ts`)

#### `usePaystackPayment()`

Hook for managing payment initialization state.

**Returns:**
```typescript
{
  loading: boolean;
  error: string | null;
  success: boolean;
  data: unknown;
  initialize: (request: PaymentInitRequest) => Promise<PaymentInitResponse | null>;
  reset: () => void;
}
```

**Example:**
```typescript
import { usePaystackPayment } from '@/hooks/use-paystack';

function PaymentForm() {
  const { loading, error, success, initialize, reset } = usePaystackPayment();

  const handlePayment = async () => {
    const response = await initialize({
      amount: 5000,
      email: 'customer@example.com',
      fullName: 'John Doe'
    });

    if (response?.status && response.data) {
      window.location.href = response.data.authorization_url;
    }
  };

  return (
    <div>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Payment initialized!</p>}
    </div>
  );
}
```

#### `useVerifyPayment()`

Hook for managing payment verification state.

**Returns:**
```typescript
{
  loading: boolean;
  error: string | null;
  success: boolean;
  data: unknown;
  verify: (reference: string) => Promise<PaymentVerifyResponse | null>;
  reset: () => void;
}
```

**Example:**
```typescript
import { useVerifyPayment } from '@/hooks/use-paystack';
import { useSearchParams } from '@tanstack/react-router';
import { useEffect } from 'react';

function PaymentCallback() {
  const [params] = useSearchParams();
  const reference = params.reference;
  const { loading, error, success, data, verify } = useVerifyPayment();

  useEffect(() => {
    if (reference) {
      verify(reference);
    }
  }, [reference]);

  if (loading) return <div>Verifying payment...</div>;
  
  if (error) return <div>Error: {error}</div>;
  
  if (success && data) {
    return <div>Payment verified! Amount: {data.amount / 100}</div>;
  }

  return null;
}
```

#### `useProcessRefund()`

Hook for managing refund processing state.

**Returns:**
```typescript
{
  loading: boolean;
  error: string | null;
  success: boolean;
  data: unknown;
  refund: (request: RefundRequest) => Promise<RefundResponse | null>;
  reset: () => void;
}
```

**Example:**
```typescript
import { useProcessRefund } from '@/hooks/use-paystack';

function RefundForm({ reference }) {
  const { loading, error, success, refund, reset } = useProcessRefund();

  const handleRefund = async () => {
    const response = await refund({
      reference,
      reason: 'Order cancelled by customer'
    });

    if (response?.status) {
      alert('Refund processed');
    }
  };

  return (
    <div>
      <button onClick={handleRefund} disabled={loading}>
        {loading ? 'Processing...' : 'Process Refund'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Refund processed!</p>}
    </div>
  );
}
```

## Type Definitions (`src/integrations/paystack-types.ts`)

All TypeScript types are defined in `paystack-types.ts`. Import types as needed:

```typescript
import type {
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyResponse,
  PaymentSplitRequest,
  PaymentSplitResponse,
  RefundRequest,
  RefundResponse,
  PaymentState,
  PaystackWebhookPayload,
  SplitConfig
} from '@/integrations/paystack-types';
```

## Security Considerations

1. **Never expose secret keys** in frontend code or environment files that get committed
2. **Always use `PAYSTACK_SECRET_KEY`** for server-side operations (server functions, API routes)
3. **Use `VITE_PAYSTACK_PUBLIC_KEY`** for client-side operations
4. **Validate webhook signatures** when receiving Paystack webhooks
5. **Store transaction references** in your database for audit trails
6. **Implement proper error handling** to avoid exposing sensitive information
7. **Use HTTPS** in production for all payment-related communications

## Best Practices

### 1. Store Transaction References
Always save transaction references in your database for tracking and auditing:

```typescript
await db.transactions.create({
  reference: response.data.reference,
  amount: request.amount,
  email: request.email,
  status: 'pending',
  createdAt: new Date()
});
```

### 2. Verify Payments Server-Side
Always verify payments on your server before updating order status:

```typescript
// On payment callback
const verification = await verifyPayment(reference);
if (verification.status && verification.data?.status === 'success') {
  // Update order status in database
}
```

### 3. Handle Errors Gracefully
Always handle errors and provide meaningful feedback to users:

```typescript
const response = await initialize({ /* ... */ });
if (!response.status) {
  console.error('Payment initialization failed:', response.error);
  showUserFriendlyError('Payment setup failed. Please try again.');
}
```

### 4. Use Metadata for Context
Include useful metadata to match payments with your orders:

```typescript
metadata: {
  order_id: orderId,
  user_id: userId,
  vendor_id: vendorId,
  items_count: items.length
}
```

## Testing

### Using Test Mode
1. Use test keys (starting with `pk_test_` and `sk_test_`) for testing
2. Use Paystack test card: 4111 1111 1111 1111 with any future expiry date
3. Use any 3-digit CVC

### Testing Payment Flow
```typescript
// Test payment initialization
const response = await initializePayment({
  amount: 100,
  email: 'test@example.com',
  fullName: 'Test User'
});

// Test payment verification
const verification = await verifyPayment(response.data?.reference || '');
```

## Common Issues

### Missing Environment Variables
**Error:** `VITE_PAYSTACK_PUBLIC_KEY is not configured`

**Solution:** Add the environment variable to your `.env.local` file:
```bash
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key
```

### CORS Issues
**Error:** CORS error when making requests to Paystack API

**Solution:** 
- Ensure you're using the public key for client-side requests
- Consider using a server-side endpoint for sensitive operations
- Check your Paystack dashboard settings for CORS configuration

### Payment Verification Fails
**Error:** `Payment verification failed`

**Solution:**
- Ensure the reference is correct and matches the transaction
- Check that your secret key is valid
- Verify the transaction exists on Paystack dashboard

## Additional Resources

- [Paystack Documentation](https://paystack.com/docs)
- [Paystack API Reference](https://paystack.com/docs/api/)
- [Paystack Test Guide](https://paystack.com/docs/testing/)
- [Payment Integration Best Practices](https://paystack.com/docs/guides/)

## Support

For issues related to:
- **Paystack API**: Contact [Paystack Support](https://paystack.com/support)
- **Integration in this project**: Check the codebase or create an issue in the project repository
