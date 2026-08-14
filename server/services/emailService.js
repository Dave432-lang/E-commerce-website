import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter using SMTP environment variables if provided
const createTransporter = () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return null; // Null transporter triggers dev console logging fallback
};

const transporter = createTransporter();
const FROM_EMAIL = process.env.EMAIL_FROM || '"Ecommerce Boutique" <noreply@ecommerceboutique.com>';
const CLIENT_URL = process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? 'https://ecommerceboutique.com' : 'http://localhost:5173');

export const emailService = {
  /**
   * Send Password Reset Email
   */
  sendPasswordResetEmail: async (toEmail, userName, resetToken) => {
    const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;
    
    const subject = 'Reset Your Password - Ecommerce Boutique';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #111827; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb; }
          .header { text-align: center; border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 24px; }
          .header h1 { font-size: 24px; font-weight: 700; letter-spacing: 2px; margin: 0; text-transform: uppercase; }
          .content p { font-size: 16px; line-height: 1.6; color: #374151; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { background-color: #111827; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 15px; }
          .footer { font-size: 13px; color: #9ca3af; text-align: center; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px; }
          .token-box { background: #f3f4f6; padding: 12px; font-family: monospace; font-size: 14px; word-break: break-all; border-radius: 6px; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ecommerce Boutique</h1>
          </div>
          <div class="content">
            <p>Hello ${userName || 'Valued Customer'},</p>
            <p>We received a request to reset your password for your Ecommerce Boutique account. Click the button below to choose a new password:</p>
            
            <div class="btn-container">
              <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
            </div>

            <p>If you prefer, you can also copy and paste the link below into your browser:</p>
            <div class="token-box">${resetUrl}</div>

            <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">This password reset link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Ecommerce Boutique. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: FROM_EMAIL,
          to: toEmail,
          subject,
          html: htmlContent,
        });
        console.log(`[Email Service] Password reset email sent successfully to ${toEmail}`);
      } catch (err) {
        console.error(`[Email Service Error] Failed to send password reset email to ${toEmail}:`, err);
      }
    } else {
      console.log('\n======================================================');
      console.log(`[DEV MODE] EMAIL DISPATCH SIMULATION`);
      console.log(`TO: ${toEmail}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`RESET URL: ${resetUrl}`);
      console.log('======================================================\n');
    }
  },

  /**
   * Send Order Confirmation Receipt Email
   */
  sendOrderConfirmationEmail: async (toEmail, userName, order) => {
    const subject = `Order Confirmation #${order.id} - Ecommerce Boutique`;

    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
          <strong>${item.name || item.product_name}</strong>
          ${item.size ? `<br><small style="color: #6b7280;">Size: ${item.size}</small>` : ''}
          ${item.color ? `<small style="color: #6b7280;"> | Color: ${item.color}</small>` : ''}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">GH₵${(Number(item.price) * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #111827; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb; }
          .header { text-align: center; border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 24px; }
          .header h1 { font-size: 24px; font-weight: 700; letter-spacing: 2px; margin: 0; text-transform: uppercase; }
          .order-badge { background: #dcfce7; color: #16a34a; font-weight: 600; padding: 4px 12px; border-radius: 12px; display: inline-block; font-size: 14px; margin-bottom: 16px; }
          .order-details { width: 100%; border-collapse: collapse; margin-top: 16px; }
          .total-row { font-size: 18px; font-weight: 700; border-top: 2px solid #111827; }
          .footer { font-size: 13px; color: #9ca3af; text-align: center; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ecommerce Boutique</h1>
          </div>
          <div class="content">
            <span class="order-badge">✓ Payment Confirmed</span>
            <h2>Thank you for your order, ${userName || 'Customer'}!</h2>
            <p style="color: #4b5563;">Your order <strong>#${order.id}</strong> has been confirmed and is being prepared for shipment.</p>

            <table class="order-details">
              <thead>
                <tr style="text-align: left; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">
                  <th style="padding-bottom: 8px;">ITEM</th>
                  <th style="padding-bottom: 8px; text-align: center;">QTY</th>
                  <th style="padding-bottom: 8px; text-align: right;">PRICE</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="2" style="padding-top: 16px;">Total Amount Paid</td>
                  <td style="padding-top: 16px; text-align: right;">GH₵${Number(order.total_price || order.totalAmount).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 24px; background: #f9fafb; padding: 16px; border-radius: 8px; font-size: 14px;">
              <p style="margin: 0 0 6px 0;"><strong>Shipping Address:</strong> ${order.shipping_address || order.shippingAddress || 'Address provided at checkout'}</p>
              <p style="margin: 0;"><strong>Payment Method:</strong> ${order.payment_method || 'Paystack Card/Momo'}</p>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Ecommerce Boutique. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: FROM_EMAIL,
          to: toEmail,
          subject,
          html: htmlContent,
        });
        console.log(`[Email Service] Order confirmation email sent to ${toEmail} for Order #${order.id}`);
      } catch (err) {
        console.error(`[Email Service Error] Failed to send order confirmation email to ${toEmail}:`, err);
      }
    } else {
      console.log('\n======================================================');
      console.log(`[DEV MODE] ORDER CONFIRMATION EMAIL DISPATCH SIMULATION`);
      console.log(`TO: ${toEmail}`);
      console.log(`ORDER ID: #${order.id}`);
      console.log(`TOTAL: $${Number(order.total_price || order.totalAmount).toFixed(2)}`);
      console.log('======================================================\n');
    }
  }
};
