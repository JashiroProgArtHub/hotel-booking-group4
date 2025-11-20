import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('Email service is ready to send messages');
    return { success: true, message: 'Email service connected' };
  } catch (error) {
    console.error('Email service configuration error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendTestEmail(toEmail) {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error('SMTP configuration is incomplete. Check your .env file.');
    }

    if (!process.env.SMTP_FROM_EMAIL) {
      throw new Error('SMTP_FROM_EMAIL is not set in .env file.');
    }

    const info = await transporter.sendMail({
      from: `"SkyBridge Travels" <${process.env.SMTP_FROM_EMAIL}>`,
      to: toEmail,
      subject: 'Test Email - SkyBridge Travels Email Service',
      text: `This is a test email from the SkyBridge Travels backend API.

If you're receiving this email, it means:
- SMTP configuration is correct
- Nodemailer is properly configured
- Email service is ready to send notifications

Email Service Details:
- SMTP Host: ${process.env.SMTP_HOST}
- SMTP Port: ${process.env.SMTP_PORT}
- From Email: ${process.env.SMTP_FROM_EMAIL}

Test sent at: ${new Date().toISOString()}

---
SkyBridge Travels - Hotel Booking Platform
Cordova, Cebu`,
    });

    console.log('Test email sent successfully');
    console.log('Message ID:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      message: 'Test email sent successfully',
    };
  } catch (error) {
    console.error('Failed to send test email:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

export const emailTemplates = {
  bookingConfirmation: (data) => {
    const { customerName, bookingId, propertyName, checkInDate, checkOutDate, totalAmount, adults, children, numberOfNights } = data;

    return {
      subject: `Booking Confirmed - ${propertyName}`,
      text: `Dear ${customerName},

Your booking has been confirmed! We're excited to host you at ${propertyName}.

BOOKING DETAILS
Booking ID: ${bookingId}
Property: ${propertyName}
Check-in: ${checkInDate}
Check-out: ${checkOutDate}
Number of Nights: ${numberOfNights}
Guests: ${adults} adult(s)${children > 0 ? `, ${children} child(ren)` : ''}

PAYMENT SUMMARY
Total Amount Paid: PHP ${totalAmount.toFixed(2)}

IMPORTANT INFORMATION
- Please bring a valid ID for check-in
- Check-in time: as specified by the property
- Check-out time: as specified by the property
- Your booking reference: ${bookingId}

If you have any questions about your booking, please contact the property directly or reach out to our support team.

We hope you have a wonderful stay!

---
SkyBridge Travels
Hotel Booking Platform
Cordova, Cebu

This is an automated message. Please do not reply to this email.`
    };
  },

  propertySubmission: (data) => {
    const { ownerName, propertyName } = data;

    return {
      subject: 'Property Submitted - Under Review',
      text: `Dear ${ownerName},

Thank you for submitting your property to SkyBridge Travels!

PROPERTY SUBMITTED
Property Name: ${propertyName}
Status: Pending Review

WHAT HAPPENS NEXT
Our admin team will review your property submission within the next few business days. We will check:
- Property information and description
- Images quality and appropriateness
- Pricing and room details
- Location verification (Cordova, Cebu)
- Amenities and facilities

REVIEW TIMELINE
You can expect to hear from us soon regarding your property status. We will notify you via email once the review is complete.

If your property is approved, it will be published on our platform and become visible to customers searching for accommodations in Cordova, Cebu.

If we need any changes or have questions, we will provide feedback and you can resubmit your property.

Thank you for partnering with SkyBridge Travels!

---
SkyBridge Travels
Hotel Booking Platform
Cordova, Cebu

This is an automated message. Please do not reply to this email.`
    };
  },

  propertyApproval: (data) => {
    const { ownerName, propertyName } = data;

    return {
      subject: `Property Approved - ${propertyName}`,
      text: `Dear ${ownerName},

Congratulations! Your property has been approved and is now live on SkyBridge Travels!

PROPERTY APPROVED
Property Name: ${propertyName}
Status: Published

WHAT THIS MEANS
Your property is now visible to customers searching for accommodations in Cordova, Cebu. Guests can view your property details, see photos, check availability, and make bookings.

NEXT STEPS
- Your property is now searchable on our platform
- Customers can book rooms at your property
- You will receive notifications when bookings are made
- Keep your property information and availability up to date

MANAGING YOUR PROPERTY
You can manage your property details, room types, and pricing through your owner dashboard. Make sure to keep your information accurate and up to date.

Thank you for partnering with SkyBridge Travels! We look forward to helping you connect with travelers visiting Cordova, Cebu.

---
SkyBridge Travels
Hotel Booking Platform
Cordova, Cebu

This is an automated message. Please do not reply to this email.`
    };
  },

  propertyRejection: (data) => {
    const { ownerName, propertyName, rejectionReason } = data;

    return {
      subject: `Property Submission Feedback - ${propertyName}`,
      text: `Dear ${ownerName},

Thank you for submitting your property to SkyBridge Travels. After reviewing your submission, we need some improvements before we can approve your property.

PROPERTY REVIEWED
Property Name: ${propertyName}
Status: Needs Revision

FEEDBACK FROM OUR TEAM
${rejectionReason || 'Please review and improve your property information before resubmitting.'}

WHAT TO DO NEXT
You can edit your property submission and resubmit it for review. To do this:
1. Log in to your owner dashboard
2. Go to "My Properties"
3. Edit the property details based on our feedback
4. Submit again for review

Once you resubmit, our team will review it again. We want to ensure all properties on our platform meet our quality standards to provide the best experience for travelers.

If you have any questions about the feedback or need clarification, please contact our support team.

Thank you for your understanding and cooperation!

---
SkyBridge Travels
Hotel Booking Platform
Cordova, Cebu

This is an automated message. Please do not reply to this email.`
    };
  },
};

export async function sendEmail(to, template) {
  try {
    if (!process.env.SMTP_FROM_EMAIL) {
      throw new Error('SMTP_FROM_EMAIL is not configured');
    }

    if (!template.subject || !template.text) {
      throw new Error('Email template must have subject and text properties');
    }

    const info = await transporter.sendMail({
      from: `"SkyBridge Travels" <${process.env.SMTP_FROM_EMAIL}>`,
      to: to,
      subject: template.subject,
      text: template.text,
    });

    console.log('Email sent successfully to:', to);
    console.log('Message ID:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Failed to send email:', error.message);

    return {
      success: false,
      error: error.message,
    };
  }
}

export default {
  verifyEmailConfig,
  sendTestEmail,
  sendEmail,
  emailTemplates,
};
