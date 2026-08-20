import { emailService } from '../services/emailService.js';

describe('Email Service Notification Tests', () => {
  it('1. should execute sendPasswordResetEmail without error in dev mode', async () => {
    await expect(
      emailService.sendPasswordResetEmail('customer@example.com', 'John Doe', 'test-token-123')
    ).resolves.not.toThrow();
  });

  it('2. should execute sendOrderConfirmationEmail without error in dev mode', async () => {
    const mockOrder = {
      id: 999,
      total_price: 250.00,
      items: [
        { name: 'Silk Luxury Shirt', size: 'L', color: 'Black', quantity: 1, price: 250.00 }
      ],
      shipping_address: '123 Luxury Way, Accra',
      payment_method: 'Paystack Card'
    };

    await expect(
      emailService.sendOrderConfirmationEmail('customer@example.com', 'John Doe', mockOrder)
    ).resolves.not.toThrow();
  });

  it('3. should execute sendAdminOrderNotificationEmail without error in dev mode', async () => {
    const mockOrder = {
      id: 1000,
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      total_price: 450.00,
      items: [
        { name: 'Aurum Velvet Blazer', size: 'M', color: 'Gold', quantity: 1, price: 450.00 }
      ],
      shipping_address: '456 Royal St, Kumasi',
      payment_method: 'Paystack Momo'
    };

    await expect(
      emailService.sendAdminOrderNotificationEmail(mockOrder)
    ).resolves.not.toThrow();
  });
});
