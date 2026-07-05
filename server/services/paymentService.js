import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

export const paymentService = {
  /**
   * Verify a transaction via Paystack REST API
   * @param {string} reference - Paystack transaction reference
   * @returns {Promise<object>} - Object containing status, amount, and payment channel meta if successful
   */
  verifyTransaction: async (reference) => {
    const paystackUrl = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;
    
    const response = await fetch(paystackUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    return await response.json();
  },

  /**
   * Verify HMAC signature for Paystack webhook events
   * @param {string} rawBody - Raw body payload as string
   * @param {string} signature - Signature header value
   * @returns {boolean} - True if signature is valid
   */
  verifySignature: (rawBody, signature) => {
    if (!signature) return false;
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET || '')
      .update(rawBody)
      .digest('hex');
    return hash === signature;
  }
};
