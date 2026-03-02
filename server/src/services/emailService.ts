/**
 * Email Service
 * Handles transactional emails using Nodemailer
 */
import nodemailer from 'nodemailer';
import config from '../config';

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

/**
 * Send a subscription expiration warning email
 */
export const sendExpirationWarning = async (
  to: string,
  name: string,
  expirationDate: Date,
  daysLeft: number
): Promise<void> => {
  const formattedDate = expirationDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `Your README Pro subscription expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Expiring Soon</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1, #3b82f6); padding: 32px; text-align: center;">
                    <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">
                      README Generator Pro
                    </h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 32px;">
                    <h2 style="margin: 0 0 16px; color: #f8fafc; font-size: 20px;">
                      Hi ${name},
                    </h2>
                    <p style="margin: 0 0 24px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                      Your <strong style="color: #fbbf24;">Pro subscription</strong> is expiring on 
                      <strong style="color: #f8fafc;">${formattedDate}</strong> 
                      -- that's just <strong style="color: #ef4444;">${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong> away.
                    </p>
                    
                    <div style="background-color: #0f172a; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #334155;">
                      <h3 style="margin: 0 0 12px; color: #fbbf24; font-size: 16px;">
                        What you'll lose without Pro:
                      </h3>
                      <ul style="margin: 0; padding-left: 20px; color: #94a3b8; font-size: 14px; line-height: 2;">
                        <li>Unlimited README exports</li>
                        <li>Premium templates (Advanced Pro)</li>
                        <li>Custom sections</li>
                        <li>Priority support</li>
                      </ul>
                    </div>
                    
                    <p style="margin: 0 0 24px; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                      Renew now to keep generating professional READMEs without any limits.
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${config.clientUrl}/pricing" 
                             style="display: inline-block; background: linear-gradient(135deg, #6366f1, #3b82f6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Renew Subscription →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 32px; border-top: 1px solid #334155; text-align: center;">
                    <p style="margin: 0; color: #64748b; font-size: 12px;">
                      You're receiving this email because you have an active Pro subscription. 
                      <br/>
                      © ${new Date().getFullYear()} README Generator Pro. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] Expiration warning sent to ${to} (${daysLeft} days left)`);
  } catch (error) {
    console.error(`[ERROR] Failed to send expiration email to ${to}:`, error);
  }
};

/**
 * Send a subscription expired notification email
 */
export const sendExpiredNotification = async (
  to: string,
  name: string
): Promise<void> => {
  const subject = 'Your README Pro subscription has expired';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1, #3b82f6); padding: 32px; text-align: center;">
                    <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">
                      README Generator Pro
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 32px;">
                    <h2 style="margin: 0 0 16px; color: #f8fafc; font-size: 20px;">
                      Hi ${name},
                    </h2>
                    <p style="margin: 0 0 24px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                      Your Pro subscription has expired. Your account has been downgraded to the 
                      <strong style="color: #f8fafc;">Free plan</strong>.
                    </p>
                    <p style="margin: 0 0 24px; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                      You can still use the generator with free templates and up to 5 exports per month. 
                      Resubscribe anytime to get back to unlimited access.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${config.clientUrl}/pricing" 
                             style="display: inline-block; background: linear-gradient(135deg, #6366f1, #3b82f6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Resubscribe →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px 32px; border-top: 1px solid #334155; text-align: center;">
                    <p style="margin: 0; color: #64748b; font-size: 12px;">
                      © ${new Date().getFullYear()} README Generator Pro. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] Expiration notification sent to ${to}`);
  } catch (error) {
    console.error(`[ERROR] Failed to send expired email to ${to}:`, error);
  }
};

/**
 * Verify email connection on startup (optional, non-blocking)
 */
export const verifyEmailConnection = async (): Promise<boolean> => {
  if (!config.email.user || !config.email.pass) {
    console.log('[WARN] Email credentials not configured -- email notifications disabled');
    return false;
  }

  try {
    await transporter.verify();
    console.log('[OK] Email service connected');
    return true;
  } catch (error) {
    console.warn('[WARN] Email service not available:', (error as Error).message);
    return false;
  }
};

export default transporter;
