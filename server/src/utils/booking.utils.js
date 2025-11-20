export function calculateNumberOfNights(checkIn, checkOut) {
  const checkInDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const checkOutDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;

  const diffInMs = checkOutDate.getTime() - checkInDate.getTime();
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

  return diffInDays;
}

export function generateBookingId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomPart += chars[randomIndex];
  }

  return `GEM-${randomPart}`;
}

export function calculateBookingPrice(roomPrice, nights, taxRate = 0.12) {
  const subtotal = roomPrice * nights;
  const taxesAndFees = subtotal * taxRate;
  const totalAmount = subtotal + taxesAndFees;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxesAndFees: Math.round(taxesAndFees * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100
  };
}
