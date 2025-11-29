import prisma from '../config/database.js';
import { sendEmail, emailTemplates } from '../services/email.service.js';
import { NotFoundError, ValidationError, AuthorizationError } from '../middleware/errorHandler.js';

export async function getPendingProperties(req, res) {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        roomTypes: true
      },
      orderBy: {
        submissionDate: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Error in getPendingProperties:', error);
    throw error;
  }
}

export async function getAllProperties(req, res) {
  try {
    const { status } = req.query;
    const whereClause = status ? { status: status.toUpperCase() } : {};

    const properties = await prisma.property.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        roomTypes: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Error in getAllProperties:', error);
    throw error;
  }
}

export async function approveProperty(req, res) {
  try {
    const { id } = req.params;
    const adminUserId = req.user.id;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        reviewedDate: new Date(),
        reviewedById: adminUserId
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        roomTypes: true
      }
    });

    try {
      const ownerName = property.owner.firstName && property.owner.lastName
        ? `${property.owner.firstName} ${property.owner.lastName}`
        : 'Hotel Owner';

      const emailTemplate = emailTemplates.propertyApproval({
        ownerName,
        propertyName: property.name
      });

      await sendEmail(property.owner.email, emailTemplate);
      console.log('Property approval email sent successfully to:', property.owner.email);
    } catch (emailError) {
      console.error('Error sending approval email:', emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Property approved successfully',
      data: updatedProperty
    });
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Error in approveProperty:', error);
    throw error;
  }
}

export async function rejectProperty(req, res) {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminUserId = req.user.id;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedDate: new Date(),
        reviewedById: adminUserId,
        rejectionReason: rejectionReason || null
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        roomTypes: true
      }
    });

    try {
      const ownerName = property.owner.firstName && property.owner.lastName
        ? `${property.owner.firstName} ${property.owner.lastName}`
        : 'Hotel Owner';

      const emailTemplate = emailTemplates.propertyRejection({
        ownerName,
        propertyName: property.name,
        rejectionReason: rejectionReason || 'No specific reason provided'
      });

      await sendEmail(property.owner.email, emailTemplate);
      console.log('Property rejection email sent successfully to:', property.owner.email);
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Property rejected successfully',
      data: updatedProperty
    });
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Error in rejectProperty:', error);
    throw error;
  }
}

export async function getAllBookings(req, res) {
  try {
    const { status, startDate, endDate } = req.query;

    const whereClause = {};

    if (status) {
      whereClause.bookingStatus = status.toUpperCase();
    }

    if (startDate || endDate) {
      whereClause.checkInDate = {};
      if (startDate) {
        whereClause.checkInDate.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.checkInDate.lte = new Date(endDate);
      }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            clerkUserId: true
          }
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            contactEmail: true
          }
        },
        roomType: {
          select: {
            id: true,
            name: true,
            bedConfiguration: true,
            pricePerNight: true
          }
        },
        payment: {
          select: {
            id: true,
            xenditInvoiceId: true,
            amount: true,
            paymentMethod: true,
            paymentStatus: true,
            transactionDate: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Error in getAllBookings:', error);
    throw error;
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
            properties: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const usersWithActivity = users.map(user => {
      const { _count, ...userData } = user;
      return {
        ...userData,
        totalBookings: _count.bookings,
        totalProperties: _count.properties,
      };
    });

    return res.status(200).json({
      success: true,
      count: usersWithActivity.length,
      data: usersWithActivity
    });
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Error in getAllUsers:', error);
    throw error;
  }
}

export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminUserId = req.user.id;

    const validRoles = ['CUSTOMER', 'HOTEL_OWNER', 'ADMIN'];
    if (!role || !validRoles.includes(role)) {
      throw new ValidationError(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    if (id === adminUserId) {
      throw new AuthorizationError('You cannot change your own role');
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
            properties: true
          }
        }
      }
    });

    const { _count, ...userData } = updatedUser;

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: {
        ...userData,
        totalBookings: _count.bookings,
        totalProperties: _count.properties,
      }
    });
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Error in updateUserRole:', error);
    throw error;
  }
}
