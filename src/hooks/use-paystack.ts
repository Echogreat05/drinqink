// @ts-nocheck
/**
 * React hooks for Paystack payment integration
 * Provides hooks for payment initialization, verification, and refunds
 */

import { useState, useCallback } from 'react';
import {
  initializePayment,
  verifyPayment,
  refundPayment,
} from '@/integrations/paystack';
import type {
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyResponse,
  RefundRequest,
  RefundResponse,
  PaymentState,
} from '@/integrations/paystack-types';

/**
 * Hook for initializing Paystack payments
 * @returns Object with payment state and functions
 */
export function usePaystackPayment() {
  const [state, setState] = useState<PaymentState>({
    loading: false,
    error: null,
    success: false,
    data: null,
  });

  const initialize = useCallback(
    async (request: PaymentInitRequest): Promise<PaymentInitResponse | null> => {
      setState({
        loading: true,
        error: null,
        success: false,
        data: null,
      });

      try {
        const response = await initializePayment(request);

        if (response.status) {
          setState({
            loading: false,
            error: null,
            success: true,
            data: response.data,
          });
          return response;
        } else {
          const errorMessage = response.error || response.message || 'Payment initialization failed';
          setState({
            loading: false,
            error: errorMessage,
            success: false,
            data: null,
          });
          return response;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        setState({
          loading: false,
          error: errorMessage,
          success: false,
          data: null,
        });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      data: null,
    });
  }, []);

  return {
    ...state,
    initialize,
    reset,
  };
}

/**
 * Hook for verifying Paystack payments
 * @returns Object with verification state and verify function
 */
export function useVerifyPayment() {
  const [state, setState] = useState<PaymentState>({
    loading: false,
    error: null,
    success: false,
    data: null,
  });

  const verify = useCallback(
    async (reference: string): Promise<PaymentVerifyResponse | null> => {
      if (!reference) {
        setState({
          loading: false,
          error: 'Transaction reference is required',
          success: false,
          data: null,
        });
        return null;
      }

      setState({
        loading: true,
        error: null,
        success: false,
        data: null,
      });

      try {
        const response = await verifyPayment(reference);

        if (response.status) {
          setState({
            loading: false,
            error: null,
            success: true,
            data: response.data,
          });
          return response;
        } else {
          const errorMessage = response.error || response.message || 'Payment verification failed';
          setState({
            loading: false,
            error: errorMessage,
            success: false,
            data: null,
          });
          return response;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        setState({
          loading: false,
          error: errorMessage,
          success: false,
          data: null,
        });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      data: null,
    });
  }, []);

  return {
    ...state,
    verify,
    reset,
  };
}

/**
 * Hook for processing refunds
 * @returns Object with refund state and refund function
 */
export function useProcessRefund() {
  const [state, setState] = useState<PaymentState>({
    loading: false,
    error: null,
    success: false,
    data: null,
  });

  const refund = useCallback(
    async (request: RefundRequest): Promise<RefundResponse | null> => {
      if (!request.reference) {
        setState({
          loading: false,
          error: 'Transaction reference is required',
          success: false,
          data: null,
        });
        return null;
      }

      setState({
        loading: true,
        error: null,
        success: false,
        data: null,
      });

      try {
        const response = await refundPayment(request);

        if (response.status) {
          setState({
            loading: false,
            error: null,
            success: true,
            data: response.data,
          });
          return response;
        } else {
          const errorMessage = response.error || response.message || 'Refund processing failed';
          setState({
            loading: false,
            error: errorMessage,
            success: false,
            data: null,
          });
          return response;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        setState({
          loading: false,
          error: errorMessage,
          success: false,
          data: null,
        });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      data: null,
    });
  }, []);

  return {
    ...state,
    refund,
    reset,
  };
}
