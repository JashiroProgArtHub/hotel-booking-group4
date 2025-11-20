import prisma from '../config/database.js';
import { sendEmail, emailTemplates } from '../services/email.service.js';
import { NotFoundError, AuthorizationError } from '../middleware/errorHandler.js';

export async function searchProperties(req, res) {
  try {
    const {
      checkIn,
      checkOut,
      adults,
      children,
      minPrice,
      maxPrice,
      propertyType,
      amenities
    } = req.query;

    const filters = {
      status: 'PUBLISHED'
    };

    if (propertyType) {
      filters.propertyType = propertyType;
    }

    if (amenities) {
      const amenitiesArray = amenities.split(',').map(a => a.trim());
      filters.amenities = {
        hasEvery: amenitiesArray
      };
    }

    const properties = await prisma.property.findMany({
      where: filters,
      include: {
        roomTypes: {
          where: {
            ...(minPrice && { pricePerNight: { gte: parseFloat(minPrice) } }),
            ...(maxPrice && { pricePerNight: { lte: parseFloat(maxPrice) } })
          }
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const filteredProperties = (minPrice || maxPrice)
      ? properties.filter(p => p.roomTypes.length > 0)
      : properties;

    return res.status(200).json({
      success: true,
      count: filteredProperties.length,
      data: filteredProperties
    });
  } catch (error) {
    console.error('Error in searchProperties:', error);
    throw error;
  }
}

export async function getPropertyById(req, res) {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        roomTypes: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    return res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    if (error.name === 'NotFoundError' || error.statusCode) {
      throw error;
    }
    console.error('Error in getPropertyById:', error);
    throw error;
  }
}

export async function createProperty(req, res) {
  try {
    const clerkUserId = req.auth.userId;
    console.log(clerkUserId)
    let user = await prisma.user.findUnique({
      where: { clerkUserId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role === 'CUSTOMER') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'HOTEL_OWNER' }
      });
    }

    const propertyData = req.body;
    propertyData.city = 'Cordova, Cebu';

    const { roomTypes, ...propertyFields } = propertyData;

    const property = await prisma.property.create({
      data: {
        ...propertyFields,
        ownerId: user.id,
        status: 'PENDING',
        submissionDate: new Date(),
        roomTypes: {
          create: roomTypes
        }
      },
      include: {
        roomTypes: true
      }
    });

    try {
      const ownerName = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : 'Hotel Owner';

      const emailTemplate = emailTemplates.propertySubmission({
        ownerName,
        propertyName: property.name
      });

      await sendEmail(user.email, emailTemplate);
      console.log('Property submission confirmation email sent successfully to:', user.email);
    } catch (emailError) {
      console.error('Error sending property submission email:', emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Property submitted for review',
      data: property
    });
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Error in createProperty:', error);
    throw error;
  }
}

export async function updateProperty(req, res) {
  try {
    const { id } = req.params;
    const clerkUserId = req.auth.userId;

    const user = await prisma.user.findUnique({
      where: { clerkUserId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const existingProperty = await prisma.property.findUnique({
      where: { id }
    });

    if (!existingProperty) {
      throw new NotFoundError('Property not found');
    }

    if (existingProperty.ownerId !== user.id) {
      throw new AuthorizationError('You do not have permission to update this property');
    }

    const propertyData = req.body;
    propertyData.city = 'Cordova, Cebu';

    const { roomTypes, ...propertyFields } = propertyData;

    await prisma.roomType.deleteMany({
      where: { propertyId: id }
    });

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...propertyFields,
        status: 'PENDING',
        submissionDate: new Date(),
        roomTypes: {
          create: roomTypes
        }
      },
      include: {
        roomTypes: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Property updated and submitted for review',
      data: updatedProperty
    });
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Error in updateProperty:', error);
    throw error;
  }
}

export async function getOwnerProperties(req, res) {
  try {
    const clerkUserId = req.auth.userId;

    const user = await prisma.user.findUnique({
      where: { clerkUserId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const properties = await prisma.property.findMany({
      where: {
        ownerId: user.id
      },
      include: {
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
    console.error('Error in getOwnerProperties:', error);
    throw error;
  }
}
