import { z } from 'zod';

export const createPaymentInvoiceSchema = z.object({
  bookingId: z.string({
    required_error: "Booking ID is required",
    invalid_type_error: "Booking ID must be a string"
  }).min(1, "Booking ID cannot be empty")
});
