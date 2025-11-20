import { z } from 'zod';

export const createBookingSchema = z.object({
  propertyId: z.string({
    required_error: "Property ID is required",
    invalid_type_error: "Property ID must be a string"
  }).min(1, "Property ID cannot be empty"),

  roomTypeId: z.string({
    required_error: "Room type ID is required",
    invalid_type_error: "Room type ID must be a string"
  }).min(1, "Room type ID cannot be empty"),

  checkInDate: z.string({
    required_error: "Check-in date is required",
    invalid_type_error: "Check-in date must be a string"
  }).regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, {
    message: "Check-in date must be in YYYY-MM-DD format or ISO 8601 format"
  }).refine((date) => !isNaN(Date.parse(date)), {
    message: "Check-in date must be a valid date"
  }),

  checkOutDate: z.string({
    required_error: "Check-out date is required",
    invalid_type_error: "Check-out date must be a string"
  }).regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, {
    message: "Check-out date must be in YYYY-MM-DD format or ISO 8601 format"
  }).refine((date) => !isNaN(Date.parse(date)), {
    message: "Check-out date must be a valid date"
  }),

  adults: z.number({
    required_error: "Number of adults is required",
    invalid_type_error: "Number of adults must be a number"
  }).int("Number of adults must be a whole number")
    .min(1, "At least 1 adult is required")
    .max(10, "Maximum 10 adults allowed"),

  children: z.number({
    invalid_type_error: "Number of children must be a number"
  }).int("Number of children must be a whole number")
    .min(0, "Number of children cannot be negative")
    .max(10, "Maximum 10 children allowed")
    .default(0)

}).refine((data) => {
  const checkIn = new Date(data.checkInDate);
  const checkOut = new Date(data.checkOutDate);
  return checkOut > checkIn;
}, {
  message: "Check-out date must be after check-in date",
  path: ["checkOutDate"]
});

export const cancelBookingSchema = z.object({
  reason: z.string({
    invalid_type_error: "Reason must be a string"
  }).optional()
});
