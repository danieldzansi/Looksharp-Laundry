import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Customer confirmation email template
const getCustomerEmailTemplate = ({
  customerName,
  planName,
  planPrice,
  startDate,
  nextBillingDate,
  pickupsPerMonth,
  bagsPerPickup,
  pickupDay,
  pickupTimeSlot,
  pickupFrequency,
  subscriptionId,
  features,
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return `GHS ${parseFloat(amount).toFixed(2)}`;
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Confirmation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 650px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .logo-section {
      background-color: #ffffff;
      padding: 30px;
      text-align: center;
      border-bottom: 1px solid #e9ecef;
    }
    .logo-section img {
      max-width: 180px;
      height: auto;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 8px 0 0;
      font-size: 14px;
      opacity: 0.95;
    }
    .content {
      padding: 35px 30px;
    }
    .alert-badge {
      display: inline-block;
      background-color: #10b981;
      color: white;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #667eea;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      background-color: #f9fafb;
      border-radius: 6px;
      overflow: hidden;
    }
    .info-table td {
      padding: 14px;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-table tr:last-child td {
      border-bottom: none;
    }
    .info-table td:first-child {
      font-weight: 600;
      color: #4b5563;
      width: 40%;
    }
    .info-table td:last-child {
      color: #1f2937;
    }
    .highlight-box {
      background: linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%);
      border-left: 4px solid #667eea;
      padding: 18px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .highlight-box p {
      margin: 0;
      color: #4c1d95;
      font-size: 14px;
    }
    .highlight-box strong {
      color: #5b21b6;
    }
    .features-list {
      list-style: none;
      padding: 0;
      margin: 15px 0;
    }
    .features-list li {
      padding: 8px 0;
      padding-left: 30px;
      position: relative;
      color: #555555;
    }
    .features-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #667eea;
      font-weight: bold;
      font-size: 18px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .reference-code {
      font-family: 'Courier New', monospace;
      background-color: #e5e7eb;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 13px;
      color: #1f2937;
    }
    .footer {
      background-color: #f9fafb;
      padding: 25px;
      text-align: center;
      color: #6b7280;
      font-size: 13px;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 4px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-section">
      <!-- Replace this URL with your company logo -->
      <img src="${process.env.COMPANY_LOGO_URL || 'https://bucket-production-db9c.up.railway.app/mintorganic/1765370574919-luksharp.png'}" alt="Company Logo" />
    </div>
    
    <div class="header">
      <h1>🎉 Subscription Activated!</h1>
      <p>Thank you for choosing our service</p>
    </div>
    
    <div class="content">
      <div class="alert-badge">✓ Payment Confirmed</div>
      
      <p style="font-size: 16px; margin-bottom: 25px;">Dear ${customerName},</p>
      
      <p>Thank you for subscribing to our laundry service! Your payment has been successfully processed, and your subscription is now active.</p>
      
      <div class="highlight-box">
        <p><strong>Subscription ID:</strong> <span class="reference-code">${subscriptionId}</span></p>
      </div>
      
      <div class="section">
        <h2 class="section-title">Plan Details</h2>
        <table class="info-table">
          <tr>
            <td>Plan Name</td>
            <td><strong>${planName}</strong></td>
          </tr>
          <tr>
            <td>Monthly Price</td>
            <td><strong>${formatCurrency(planPrice)}</strong></td>
          </tr>
          <tr>
            <td>Pickups Per Month</td>
            <td>${pickupsPerMonth} pickups</td>
          </tr>
          <tr>
            <td>Bags Per Pickup</td>
            <td>${bagsPerPickup} bags</td>
          </tr>
        </table>
      </div>
      
      <div class="section">
        <h2 class="section-title">Subscription Period</h2>
        <table class="info-table">
          <tr>
            <td>Start Date</td>
            <td>${formatDate(startDate)}</td>
          </tr>
          <tr>
            <td>Next Billing Date</td>
            <td>${formatDate(nextBillingDate)}</td>
          </tr>
        </table>
      </div>
      
      <div class="section">
        <h2 class="section-title">Pickup Schedule</h2>
        <table class="info-table">
          <tr>
            <td>Pickup Frequency</td>
            <td><strong>${pickupFrequency.charAt(0).toUpperCase() + pickupFrequency.slice(1)}</strong></td>
          </tr>
          ${pickupDay ? `
          <tr>
            <td>Preferred Day</td>
            <td><strong>${pickupDay}</strong></td>
          </tr>
          ` : ''}
          <tr>
            <td>Time Slot</td>
            <td><strong>${pickupTimeSlot}</strong></td>
          </tr>
        </table>
      </div>
      
      ${features && features.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Plan Features</h2>
        <ul class="features-list">
          ${features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      
      <div class="section" style="text-align: center;">
        <a href="${process.env.FRONTEND_URL}/dashboard" class="cta-button">View My Dashboard</a>
      </div>
      
      <div class="highlight-box">
        <p><strong>What's Next?</strong></p>
        <p style="margin-top: 10px;">Our team will reach out to confirm your first pickup. You can track all your pickups and deliveries through your customer dashboard.</p>
      </div>
      
      <p style="margin-top: 30px; color: #666666;">If you have any questions or need to make changes to your subscription, please don't hesitate to contact our support team.</p>
    </div>
    
    <div class="footer">
      <p><strong>Premium Laundry Service</strong></p>
      <p>Email: support@danieldzansi.me | Phone: +233 XX XXX XXXX</p>
      <p style="margin-top: 10px; color: #9ca3af;">Generated on ${formatDate(new Date())}</p>
      <p style="margin-top: 10px; font-size: 12px; color: #9ca3af;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

// Admin notification email template
const getAdminEmailTemplate = ({
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  planName,
  planPrice,
  startDate,
  nextBillingDate,
  pickupsPerMonth,
  bagsPerPickup,
  pickupDay,
  pickupTimeSlot,
  pickupFrequency,
  subscriptionId,
  amountPaid,
  paystackReference,
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return `GHS ${parseFloat(amount).toFixed(2)}`;
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Subscription Alert</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 650px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .logo-section {
      background-color: #ffffff;
      padding: 30px;
      text-align: center;
      border-bottom: 1px solid #e9ecef;
    }
    .logo-section img {
      max-width: 180px;
      height: auto;
    }
    .header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 8px 0 0;
      font-size: 14px;
      opacity: 0.95;
    }
    .content {
      padding: 35px 30px;
    }
    .alert-badge {
      display: inline-block;
      background-color: #10b981;
      color: white;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f093fb;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      background-color: #f9fafb;
      border-radius: 6px;
      overflow: hidden;
    }
    .info-table td {
      padding: 14px;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-table tr:last-child td {
      border-bottom: none;
    }
    .info-table td:first-child {
      font-weight: 600;
      color: #4b5563;
      width: 40%;
    }
    .info-table td:last-child {
      color: #1f2937;
    }
    .highlight-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-left: 4px solid #f59e0b;
      padding: 18px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .highlight-box p {
      margin: 0;
      color: #78350f;
      font-size: 14px;
    }
    .highlight-box strong {
      color: #92400e;
    }
    .action-box {
      background-color: #eff6ff;
      border: 2px solid #3b82f6;
      padding: 20px;
      border-radius: 6px;
      margin: 25px 0;
    }
    .action-box h3 {
      margin: 0 0 12px 0;
      color: #1e40af;
      font-size: 16px;
    }
    .action-box p {
      margin: 0;
      color: #1e40af;
      font-size: 14px;
      line-height: 1.5;
    }
    .reference-code {
      font-family: 'Courier New', monospace;
      background-color: #e5e7eb;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 13px;
      color: #1f2937;
    }
    .footer {
      background-color: #f9fafb;
      padding: 25px;
      text-align: center;
      color: #6b7280;
      font-size: 13px;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-section">
      <!-- Replace this URL with your company logo -->
      <img src="${process.env.COMPANY_LOGO_URL || 'https://via.placeholder.com/180x60?text=Your+Logo'}" alt="Company Logo" />
    </div>
    
    <div class="header">
      <h1>🔔 New Subscription Created</h1>
      <p>Admin Notification</p>
    </div>
    
    <div class="content">
      <div class="alert-badge">✓ Payment Confirmed</div>
      
      <p style="font-size: 16px; margin-bottom: 25px;">A new customer has successfully subscribed to a plan. Please review the details below and prepare for the first pickup.</p>
      
      <div class="section">
        <h2 class="section-title">Customer Information</h2>
        <table class="info-table">
          <tr>
            <td>Full Name</td>
            <td><strong>${customerName}</strong></td>
          </tr>
          <tr>
            <td>Email</td>
            <td>${customerEmail}</td>
          </tr>
          <tr>
            <td>Phone</td>
            <td>${customerPhone}</td>
          </tr>
          <tr>
            <td>Address</td>
            <td>${customerAddress}</td>
          </tr>
        </table>
      </div>
      
      <div class="section">
        <h2 class="section-title">Subscription Details</h2>
        <table class="info-table">
          <tr>
            <td>Subscription ID</td>
            <td><span class="reference-code">${subscriptionId}</span></td>
          </tr>
          <tr>
            <td>Plan Name</td>
            <td><strong>${planName}</strong></td>
          </tr>
          <tr>
            <td>Monthly Price</td>
            <td><strong>${formatCurrency(planPrice)}</strong></td>
          </tr>
          <tr>
            <td>Amount Paid</td>
            <td><strong style="color: #10b981;">${formatCurrency(amountPaid)}</strong></td>
          </tr>
          <tr>
            <td>Start Date</td>
            <td>${formatDate(startDate)}</td>
          </tr>
          <tr>
            <td>Next Billing Date</td>
            <td>${formatDate(nextBillingDate)}</td>
          </tr>
          <tr>
            <td>Pickups Per Month</td>
            <td>${pickupsPerMonth} pickups</td>
          </tr>
          <tr>
            <td>Bags Per Pickup</td>
            <td>${bagsPerPickup} bags</td>
          </tr>
        </table>
      </div>
      
      <div class="section">
        <h2 class="section-title">Pickup Schedule</h2>
        <table class="info-table">
          <tr>
            <td>Pickup Frequency</td>
            <td><strong>${pickupFrequency.charAt(0).toUpperCase() + pickupFrequency.slice(1)}</strong></td>
          </tr>
          ${pickupDay ? `
          <tr>
            <td>Preferred Day</td>
            <td><strong>${pickupDay}</strong></td>
          </tr>
          ` : ''}
          <tr>
            <td>Time Slot</td>
            <td><strong>${pickupTimeSlot}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="section">
        <h2 class="section-title">Payment Information</h2>
        <table class="info-table">
          <tr>
            <td>Payment Status</td>
            <td><strong style="color: #10b981;">✓ Success</strong></td>
          </tr>
          <tr>
            <td>Payment Gateway</td>
            <td>Paystack</td>
          </tr>
          <tr>
            <td>Transaction Reference</td>
            <td><span class="reference-code">${paystackReference}</span></td>
          </tr>
        </table>
      </div>
      
      <div class="action-box">
        <h3>⚡ Action Required</h3>
        <p>
          1. Contact the customer to confirm the first pickup<br>
          2. Add this pickup to the schedule<br>
          3. Assign a driver for the specified date and time
        </p>
      </div>
      
      <div class="highlight-box">
        <p><strong>Note:</strong> Customer has been sent a confirmation email with all subscription details. Pickup schedules have been automatically generated in the system.</p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Premium Laundry Service - Admin Portal</strong></p>
      <p>This is an automated admin notification</p>
      <p style="margin-top: 10px; color: #9ca3af;">Generated on ${formatDate(new Date())}</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Main function to send emails to both customer and admin
export const sendSubscriptionEmails = async ({
  customerEmail,
  customerName,
  customerPhone,
  customerAddress,
  planName,
  planPrice,
  startDate,
  nextBillingDate,
  pickupsPerMonth,
  bagsPerPickup,
  pickupDay,
  pickupTimeSlot,
  pickupFrequency,
  subscriptionId,
  features,
  amountPaid,
  paystackReference,
}) => {
  try {
    // Send email to customer
    const customerEmailResult = await resend.emails.send({
      from: process.env.SEND_FROM,
      to: [customerEmail],
      subject: `Subscription Confirmed - ${planName}`,
      html: getCustomerEmailTemplate({
        customerName,
        planName,
        planPrice,
        startDate,
        nextBillingDate,
        pickupsPerMonth,
        bagsPerPickup,
        pickupDay,
        pickupTimeSlot,
        pickupFrequency,
        subscriptionId,
        features,
      }),
    });

    // Send notification email to admin
    const adminEmailResult = await resend.emails.send({
      from: process.env.SEND_FROM,
      to: [process.env.ADMIN_EMAIL_SEND],
      subject: `🔔 New Subscription: ${customerName} - ${planName}`,
      html: getAdminEmailTemplate({
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        planName,
        planPrice,
        startDate,
        nextBillingDate,
        pickupsPerMonth,
        bagsPerPickup,
        pickupDay,
        pickupTimeSlot,
        pickupFrequency,
        subscriptionId,
        amountPaid,
        paystackReference,
      }),
    });

    if (customerEmailResult.error || adminEmailResult.error) {
      console.error('Error sending emails:', {
        customerError: customerEmailResult.error,
        adminError: adminEmailResult.error,
      });
      return {
        success: false,
        error: customerEmailResult.error || adminEmailResult.error,
      };
    }

    console.log('Emails sent successfully:', {
      customer: customerEmailResult.data,
      admin: adminEmailResult.data,
    });

    return {
      success: true,
      data: {
        customer: customerEmailResult.data,
        admin: adminEmailResult.data,
      },
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

