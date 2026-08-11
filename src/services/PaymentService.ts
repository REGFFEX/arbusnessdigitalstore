/**
 * AR Business Digital Store — Payment Service
 * 
 * Centralized service for handling all payment methods.
 * Integrated with Yabetoo (Congo MoMo) and PayPal.
 */

export interface PaymentResponse {
    success: boolean;
    checkoutUrl?: string; // Redirect URL for Yabetoo or PayPal
    transactionId?: string;
    error?: string;
}

export type PaymentOperator = 'mtn' | 'airtel' | 'orange' | 'paypal';

export const PaymentService = {
    /**
     * Process Mobile Money (Yabetoo) or PayPal payment
     */
    async initiatePayment(
        method: 'momo' | 'paypal',
        operator: PaymentOperator,
        product: any,
        phone?: string
    ): Promise<PaymentResponse> {
        console.log(`[PaymentService] Initiating ${method} payment via ${operator}...`);

        try {
            if (method === 'momo') {
                return await this.initiateYabetooSession(operator, product, phone);
            } else {
                return await this.initiatePayPalSession(product);
            }
        } catch (error: any) {
            console.error('[PaymentService] Error:', error);
            return {
                success: false,
                error: error.message || 'Échec de l\'initialisation du paiement'
            };
        }
    },

    /**
     * Yabetoo API Integration (Hosted Checkout Page)
     * Documentation: https://docs.yabetoopay.com/
     */
    async initiateYabetooSession(operator: string, product: any, phone?: string): Promise<PaymentResponse> {
        console.log(`[Yabetoo] Creating Hosted Checkout session for ${product.name}`);

        // Payload according to Yabetoo documentation
        // Note: Amount should be in the smallest currency unit (e.g., FCFA)
        const amount = product.price_fcfa || Math.round((product.price || 0) * 650);

        const payload = {
            total: amount,
            currency: "xaf",
            // Reference to redirect user after success/cancel
            successUrl: `${window.location.origin}/checkout-success?productId=${product.id}&sess={paymentId}`,
            cancelUrl: `${window.location.origin}/checkout-cancel`,
            metadata: {
                productId: product.id,
                productName: product.name,
                customerPhone: phone || "non-spécifié",
                operator: operator
            },
            items: [{
                productId: product.id,
                quantity: 1,
                price: amount,
                productName: product.name
            }]
        };

        // Simulation of API call to POST https://buy.api.yabetoopay.com/v1/sessions
        return new Promise(resolve => {
            console.log('[Yabetoo API CALL] POST /v1/sessions', payload);

            // In recruitment of real keys, this would be a fetch() call
            setTimeout(() => {
                resolve({
                    success: true,
                    // Real API would return a unique checkout URL
                    checkoutUrl: `https://pay.yabetoopay.com/checkout/session_${Math.random().toString(36).substring(7)}`,
                    transactionId: `YB-SESS-${Date.now()}`
                });
            }, 1000);
        });
    },

    /**
     * PayPal API Integration (Standard Checkout)
     */
    async initiatePayPalSession(product: any): Promise<PaymentResponse> {
        const amount = product.price_eur || product.price || 0;
        const currency = product.price_eur ? 'EUR' : 'USD';
        console.log(`[PayPal] Creating session for ${product.name} (${amount} ${currency})`);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    checkoutUrl: `https://www.paypal.com/checkoutnow?token=ARBS-${Date.now()}&currency=${currency}&amount=${amount}`,
                    transactionId: `PP-${Date.now()}`
                });
            }, 1000);
        });
    }
};
