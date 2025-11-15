import prisma from '../config/database.js';
import { getUser } from '../utils/user.utils.js';
import {
  calculateNumberOfNights,
  generateBookingId,
  calculateBookingPrice
} from '../utils/booking.utils.js';

export async function createBooking(req, res) {
  try {
    console.log('=== Create Booking Debug ===');
    console.log('req.auth:', req.auth);
    console.log('req.body:', req.body);

    const { propertyId, roomTypeId, checkInDate, checkOutDate, adults, children } = req.body;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { roomTypes: true }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    if (property.status !== 'PUBLISHED') {
      return res.status(400).json({
        success: false,
        error: 'Property is not available for booking'
      });
    }

    const roomType = property.roomTypes.find(rt => rt.id === roomTypeId);

    if (!roomType) {
      return res.status(404).json({
        success: false,
        error: 'Room type not found'
      });
    }

    const overlappingBookings = await prisma.booking.count({
      where: {
        roomTypeId,
        bookingStatus: { not: 'CANCELLED' },
        AND: [
          { checkInDate: { lt: new Date(checkOutDate) } },
          { checkOutDate: { gt: new Date(checkInDate) } }
        ]
      }
    });

    if (overlappingBookings >= roomType.availableRooms) {
      return res.status(400).json({
        success: false,
        error: 'No rooms available for selected dates'
      });
    }

    const numberOfNights = calculateNumberOfNights(checkInDate, checkOutDate);
    const bookingId = generateBookingId();
    const pricing = calculateBookingPrice(roomType.pricePerNight, numberOfNights);

    const user = await getUser(req.auth.userId);

    const booking = await prisma.booking.create({
      data: {
        bookingId,
        userId: user.id,
        propertyId,
        roomTypeId,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        numberOfNights,
        adults,
        children: children || 0,
        subtotal: pricing.subtotal,
        taxesAndFees: pricing.taxesAndFees,
        totalAmount: pricing.totalAmount,
        bookingStatus: 'PENDING'
      },
      include: {
        property: {
          select: {
            name: true,
            address: true,
            city: true,
            contactEmail: true,
            checkInTime: true,
            checkOutTime: true
          }
        },
        roomType: {
          select: {
            name: true,
            bedConfiguration: true,
            maxAdults: true,
            maxChildren: true,
            pricePerNight: true,
            amenities: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create booking',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export async function getMyBookings(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: req.auth.userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        property: {
          select: {
            name: true,
            address: true,
            city: true,
            contactEmail: true,
            checkInTime: true,
            checkOutTime: true
          }
        },
        roomType: {
          select: {
            name: true,
            bedConfiguration: true,
            maxAdults: true,
            maxChildren: true,
            pricePerNight: true,
            amenities: true
          }
        },
        payment: {
          select: {
            xenditInvoiceId: true,
            amount: true,
            paymentMethod: true,
            paymentStatus: true,
            transactionDate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error('Get my bookings error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve bookings'
    });
  }
}

export async function getBookingById(req, res) {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            name: true,
            address: true,
            city: true,
            contactEmail: true,
            checkInTime: true,
            checkOutTime: true
          }
        },
        roomType: {
          select: {
            name: true,
            bedConfiguration: true,
            maxAdults: true,
            maxChildren: true,
            pricePerNight: true,
            amenities: true
          }
        },
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        },
        payment: {
          select: {
            xenditInvoiceId: true,
            amount: true,
            paymentMethod: true,
            paymentStatus: true,
            transactionDate: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkUserId: req.auth.userId }
    });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const isOwner = booking.userId === currentUser.id;
    const isAdmin = currentUser.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to view this booking'
      });
    }

    return res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve booking'
    });
  }
}

export async function cancelBooking(req, res) {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: true,
        roomType: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkUserId: req.auth.userId }
    });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (booking.userId !== currentUser.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to cancel this booking'
      });
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: 'Booking is already cancelled'
      });
    }

    const today = new Date();
    const checkInDate = new Date(booking.checkInDate);
    const daysUntilCheckIn = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilCheckIn < 7) {
      return res.status(400).json({
        success: false,
        error: 'Cancellation not allowed',
        message: 'Bookings can only be cancelled at least 7 days before check-in date'
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        bookingStatus: 'CANCELLED'
      },
      include: {
        property: {
          select: {
            name: true,
            address: true,
            city: true,
            contactEmail: true,
            checkInTime: true,
            checkOutTime: true
          }
        },
        roomType: {
          select: {
            name: true,
            bedConfiguration: true,
            maxAdults: true,
            maxChildren: true,
            pricePerNight: true,
            amenities: true
          }
        },
        payment: {
          select: {
            xenditInvoiceId: true,
            amount: true,
            paymentMethod: true,
            paymentStatus: true,
            transactionDate: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel booking'
    });
  }
}
