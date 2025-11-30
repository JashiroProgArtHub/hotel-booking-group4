import { Xendit } from 'xendit-node';
import dotenv from 'dotenv';

dotenv.config();

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY
});

export async function createXenditInvoice(bookingData) {
  try {
    const { bookingId, amount, userEmail, description } = bookingData;

    if (!bookingId || !amount || !userEmail || !description) {
      throw new Error('Missing required booking data: bookingId, amount, userEmail, or description');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const successRedirectUrl = process.env.XENDIT_SUCCESS_REDIRECT_URL || 'http://localhost:5173/booking/success';
    const failureRedirectUrl = process.env.XENDIT_FAILURE_REDIRECT_URL || 'http://localhost:5173/booking/failed';

    const { Invoice } = xenditClient;
    const invoice = await Invoice.createInvoice({
      data: {
        externalId: bookingId,
        amount: amount,
        payerEmail: userEmail,
        description: description,
        successRedirectUrl: successRedirectUrl,
        failureRedirectUrl: failureRedirectUrl,
        paymentMethods: [
          'CREDIT_CARD',
          'DEBIT_CARD',
          'EWALLET',
          'RETAIL_OUTLET',
          'BANK_TRANSFER'
        ],
        currency: 'PHP',
        invoiceDuration: 86400,
      }
    });

    return {
      invoiceUrl: invoice.invoiceUrl,
      invoiceId: invoice.id,
      expiryDate: invoice.expiryDate
    };

  } catch (error) {
    console.error('Xendit Invoice Creation Error:', error.message);

    if (error.response) {
      throw new Error(`Xendit API Error: ${error.response.data?.message || error.message}`);
    } else {
      throw new Error(`Payment service error: ${error.message}`);
    }
  }
}

export function verifyWebhookSignature(webhookToken) {
  const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;

  if (!expectedToken) {
    console.warn('XENDIT_WEBHOOK_TOKEN not configured. Skipping webhook verification.');
    return true;
  }

  return webhookToken === expectedToken;
}

export async function getInvoiceStatus(invoiceId) {
  try {
    const { Invoice } = xenditClient;
    const invoice = await Invoice.getInvoiceById({ invoiceId });

    return {
      id: invoice.id,
      status: invoice.status,
      amount: invoice.amount,
      paidAmount: invoice.paid_amount,
      externalId: invoice.external_id,
      paymentMethod: invoice.payment_method,
      paidAt: invoice.paid_at
    };

  } catch (error) {
    console.error('Error fetching invoice status:', error.message);
    throw new Error(`Failed to get invoice status: ${error.message}`);
  }
}
