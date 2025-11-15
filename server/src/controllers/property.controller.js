import prisma from '../config/database.js';
import { sendEmail, emailTemplates } from '../services/email.service.js';

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
    return res.status(500).json({
      success: false,
      error: 'Failed to search properties'
    });
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
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Error in getPropertyById:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve property'
    });
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
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
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
    console.error('Error in createProperty:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create property'
    });
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
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const existingProperty = await prisma.property.findUnique({
      where: { id }
    });

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    if (existingProperty.ownerId !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this property'
      });
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
    console.error('Error in updateProperty:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update property'
    });
  }
}

export async function getOwnerProperties(req, res) {
  try {
    const clerkUserId = req.auth.userId;

    const user = await prisma.user.findUnique({
      where: { clerkUserId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
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
    console.error('Error in getOwnerProperties:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve properties'
    });
  }
}
