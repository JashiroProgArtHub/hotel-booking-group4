import prisma from '../config/database.js';
import { createXenditInvoice, getInvoiceStatus } from '../services/payment.service.js';
import { clerkClient } from '@clerk/express';
import { sendEmail, emailTemplates } from '../services/email.service.js';
import { NotFoundError, ValidationError, AuthorizationError } from '../middleware/errorHandler.js';

export async function createPaymentInvoice(req, res) {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      throw new ValidationError('Booking ID is required');
    }

    const booking = await prisma.booking.findUnique({
      where: { bookingId },
      include: {
        property: true,
        roomType: true,
        user: true,
        payment: true
      }
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.user.clerkUserId !== req.auth.userId) {
      throw new AuthorizationError('You are not authorized to create an invoice for this booking');
    }

    if (booking.payment) {
      if (booking.payment.paymentStatus === 'PAID') {
        throw new ValidationError('This booking has already been paid');
      }

      if (booking.payment.paymentStatus === 'PENDING' || booking.payment.paymentStatus === 'FAILED') {
        throw new ValidationError('An invoice already exists for this booking');
      }
    }

    const clerkUser = await clerkClient.users.getUser(req.auth.userId);
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress || clerkUser.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      throw new ValidationError('User email not found. Please update your profile.');
    }

    const description = `Hotel Booking - ${booking.property.name} (${booking.roomType.name})`;

    const invoiceData = await createXenditInvoice({
      bookingId: booking.bookingId,
      amount: booking.totalAmount,
      userEmail: userEmail,
      description: description
    });

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        xenditInvoiceId: invoiceData.invoiceId,
        amount: booking.totalAmount,
        paymentStatus: 'PENDING'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Payment invoice created successfully',
      data: {
        invoiceUrl: invoiceData.invoiceUrl,
        invoiceId: invoiceData.invoiceId,
        amount: booking.totalAmount,
        expiryDate: invoiceData.expiryDate,
        bookingId: booking.bookingId,
        propertyName: booking.property.name,
        roomType: booking.roomType.name,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate
      }
    });

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Create Payment Invoice Error:', error);
    throw error;
  }
}

export async function handleXenditWebhook(req, res) {
  try {
    console.log('Xendit Webhook Received:', JSON.stringify(req.body, null, 2));

    const { id, external_id, status, paid_amount, payment_method } = req.body;

    if (!id || !external_id || !status) {
      console.error('Missing required webhook data:', { id, external_id, status });
      return res.status(200).json({ received: true });
    }

    if (status === 'PAID') {
      const payment = await prisma.payment.findUnique({
        where: { xenditInvoiceId: id },
        include: {
          booking: {
            include: {
              property: true,
              roomType: true,
              user: true
            }
          }
        }
      });

      if (!payment) {
        console.error('Payment not found for xenditInvoiceId:', id);
        return res.status(200).json({ received: true });
      }

      if (payment.paymentStatus === 'PAID') {
        console.log('Payment already marked as PAID:', id);
        return res.status(200).json({ received: true });
      }

      const expectedAmount = payment.booking.totalAmount;
      const paidAmount = paid_amount || 0;
      const amountDifference = Math.abs(expectedAmount - paidAmount);

      if (amountDifference > 1) {
        console.error('Payment amount mismatch:', {
          expected: expectedAmount,
          paid: paidAmount,
          difference: amountDifference,
          bookingId: payment.booking.bookingId,
          xenditInvoiceId: id
        });

        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            paymentStatus: 'FAILED',
            transactionDate: new Date()
          }
        });

        return res.status(200).json({
          received: true,
          error: 'Amount mismatch - payment marked as FAILED'
        });
      }

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentStatus: 'PAID',
          paymentMethod: payment_method || null,
          transactionDate: new Date()
        }
      });

      await prisma.booking.update({
        where: { id: payment.booking.id },
        data: {
          bookingStatus: 'CONFIRMED'
        }
      });

      console.log('Payment and Booking updated successfully:', {
        paymentId: payment.id,
        bookingId: payment.booking.bookingId,
        xenditInvoiceId: id,
        amount: paidAmount
      });

      try {
        const clerkUser = await clerkClient.users.getUser(payment.booking.user.clerkUserId);
        const userEmail = clerkUser.emailAddresses[0]?.emailAddress || clerkUser.primaryEmailAddress?.emailAddress;
        const customerName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Valued Customer';

        if (userEmail) {
          const emailTemplate = emailTemplates.bookingConfirmation({
            customerName: customerName,
            bookingId: payment.booking.bookingId,
            propertyName: payment.booking.property.name,
            checkInDate: payment.booking.checkInDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            checkOutDate: payment.booking.checkOutDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            totalAmount: payment.booking.totalAmount,
            adults: payment.booking.adults,
            children: payment.booking.children,
            numberOfNights: payment.booking.numberOfNights
          });

          const emailResult = await sendEmail(userEmail, emailTemplate);

          if (emailResult.success) {
            console.log('Booking confirmation email sent successfully to:', userEmail);
          } else {
            console.error('Failed to send booking confirmation email:', emailResult.error);
          }
        } else {
          console.error('User email not found for booking:', payment.booking.bookingId);
        }
      } catch (emailError) {
        console.error('Error sending booking confirmation email:', emailError.message);
      }

    } else if (status === 'EXPIRED' || status === 'FAILED') {
      const payment = await prisma.payment.findUnique({
        where: { xenditInvoiceId: id }
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            paymentStatus: status === 'EXPIRED' ? 'FAILED' : 'FAILED',
            transactionDate: new Date()
          }
        });

        console.log('Payment marked as FAILED:', {
          paymentId: payment.id,
          xenditInvoiceId: id,
          status
        });
      }
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Xendit Webhook Error:', error);
    return res.status(200).json({ received: true });
  }
}

export async function verifyPaymentStatus(req, res) {
  try {
    const { bookingId } = req.params;

    const whereClause = bookingId.startsWith('GEM-')
      ? { bookingId }
      : { id: bookingId };

    const booking = await prisma.booking.findUnique({
      where: whereClause,
      include: {
        payment: true,
        property: true,
        roomType: true,
        user: true
      }
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.user.clerkUserId !== req.auth.userId) {
      throw new AuthorizationError('You are not authorized to verify this payment');
    }

    if (!booking.payment) {
      return res.status(200).json({
        success: true,
        message: 'No payment record found for this booking',
        data: { bookingStatus: booking.bookingStatus, paymentStatus: null }
      });
    }

    if (booking.payment.paymentStatus === 'PAID') {
      return res.status(200).json({
        success: true,
        message: 'Payment already confirmed',
        data: { bookingStatus: booking.bookingStatus, paymentStatus: 'PAID' }
      });
    }

    const xenditStatus = await getInvoiceStatus(booking.payment.xenditInvoiceId);

    if (xenditStatus.status === 'PAID' || xenditStatus.status === 'SETTLED') {
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: {
          paymentStatus: 'PAID',
          paymentMethod: xenditStatus.paymentMethod || null,
          transactionDate: xenditStatus.paidAt ? new Date(xenditStatus.paidAt) : new Date()
        }
      });

      await prisma.booking.update({
        where: { id: booking.id },
        data: { bookingStatus: 'CONFIRMED' }
      });

      console.log('Payment verified and booking confirmed:', {
        bookingId: booking.bookingId,
        xenditInvoiceId: booking.payment.xenditInvoiceId
      });

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: { bookingStatus: 'CONFIRMED', paymentStatus: 'PAID', updated: true }
      });
    }

    if (xenditStatus.status === 'EXPIRED') {
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: { paymentStatus: 'FAILED', transactionDate: new Date() }
      });

      return res.status(200).json({
        success: true,
        message: 'Payment has expired',
        data: { bookingStatus: booking.bookingStatus, paymentStatus: 'FAILED', updated: true }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment is still pending',
      data: { bookingStatus: booking.bookingStatus, paymentStatus: xenditStatus.status }
    });

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Verify Payment Status Error:', error);
    throw error;
  }
}
