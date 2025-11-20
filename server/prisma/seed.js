import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// =============================================================================
// SEED USERS - 3 users for testing (Admin, Owner, Customer)
// =============================================================================
const seedUsers = [
  {
    clerkUserId: 'user_admin_skybridge_001',
    email: 'admin@skybridge.com',
    firstName: 'Admin',
    lastName: 'SkyBridge',
    role: 'ADMIN',
  },
  {
    clerkUserId: 'user_owner_cordova_001',
    email: 'owner@cordovahotels.com',
    firstName: 'Maria',
    lastName: 'Santos',
    role: 'HOTEL_OWNER',
  },
  {
    clerkUserId: 'user_customer_test_001',
    email: 'customer@example.com',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    role: 'CUSTOMER',
  },
];

async function main() {
  console.log('Starting database seeding...\n');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
  console.log('  Existing data cleared\n');

  // Create seed users
  console.log('Creating seed users...');
  const createdUsers = [];
  for (const userData of seedUsers) {
    const user = await prisma.user.create({ data: userData });
    createdUsers.push(user);
    console.log(`  Created ${user.role}: ${user.email}`);
  }

  const admin = createdUsers.find((u) => u.role === 'ADMIN');
  const owner = createdUsers.find((u) => u.role === 'HOTEL_OWNER');

  console.log('\nCreating properties...\n');

  // 15 properties with realistic data for Cordova, Cebu
  // All coordinates within Cordova bounds (lat: 10.23-10.27, lon: 123.94-123.98)
  // Price range: ₱1,200 - ₱8,900 per night
  const propertiesData = [
    {
      name: 'Cebu Seaside Resort & Spa',
      description: 'Experience luxury beachfront living at Cebu Seaside Resort & Spa. Our premium resort offers stunning ocean views, world-class amenities, and exceptional service. Located on the pristine shores of Cordova, enjoy direct beach access, multiple swimming pools, and fine dining restaurants. Perfect for romantic getaways, family vacations, and business retreats.',
      propertyType: 'RESORT',
      address: 'Barangay Day-as, Buyong Road',
      city: 'Cordova, Cebu',
      latitude: 10.2645,
      longitude: 123.9723,
      contactEmail: 'reservations@cebuseaside.com',
      amenities: ['Free WiFi', 'Swimming Pool', 'Beach Access', 'Restaurant', 'Bar', 'Spa', 'Fitness Center', 'Room Service', 'Parking', 'Airport Shuttle'],
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200'
      ],
      checkInTime: '2:00 PM',
      checkOutTime: '12:00 PM',
      houseRules: 'No smoking in rooms. Pets not allowed. Quiet hours from 10 PM to 7 AM. Valid ID required at check-in.',
      status: 'PUBLISHED',
      submissionDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      reviewedDate: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
      reviewedById: admin.id,
      ownerId: owner.id,
      roomTypes: [
        {
          name: 'Deluxe Ocean View',
          description: 'Spacious room with stunning ocean views, king-size bed, and private balcony.',
          bedConfiguration: '1 King Bed',
          maxAdults: 2,
          maxChildren: 1,
          pricePerNight: 4500,
          availableRooms: 15,
          images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
          amenities: ['Ocean View', 'Balcony', 'Mini Bar', 'Safe', 'Coffee Maker']
        },
        {
          name: 'Family Suite',
          description: 'Generous two-bedroom suite ideal for families.',
          bedConfiguration: '1 King Bed + 2 Single Beds',
          maxAdults: 4,
          maxChildren: 2,
          pricePerNight: 7200,
          availableRooms: 8,
          images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'],
          amenities: ['Living Area', 'Kitchenette', '2 Bathrooms', 'Dining Table']
        }
      ]
    },
    {
      name: 'Cordova Beach Hotel',
      description: 'A charming beachfront hotel offering comfortable accommodations and warm Filipino hospitality. Our property boasts a beautiful beachfront location, perfect for swimming, snorkeling, and water sports.',
      propertyType: 'HOTEL',
      address: 'Poblacion, Cordova',
      city: 'Cordova, Cebu',
      latitude: 10.2534,
      longitude: 123.9612,
      contactEmail: 'info@cordovabeach.com',
      amenities: ['Free WiFi', 'Beach Access', 'Restaurant', 'Swimming Pool', 'Parking', 'Air Conditioning', '24-Hour Front Desk'],
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200'
      ],
      checkInTime: '2:00 PM',
      checkOutTime: '11:00 AM',
      houseRules: 'No smoking in rooms. Children under 12 stay free. Valid ID required.',
      status: 'PUBLISHED',
      submissionDate: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
      reviewedDate: new Date(Date.now() - 77 * 24 * 60 * 60 * 1000),
      reviewedById: admin.id,
      ownerId: owner.id,
      roomTypes: [
        {
          name: 'Standard Room',
          description: 'Cozy and comfortable room with all essential amenities.',
          bedConfiguration: '1 Queen Bed',
          maxAdults: 2,
          maxChildren: 1,
          pricePerNight: 2800,
          availableRooms: 20,
          images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800'],
          amenities: ['WiFi', 'Air Conditioning', 'Cable TV', 'Private Bathroom']
        }
      ]
    },
    {
      name: 'Palm View Inn',
      description: 'Budget-friendly guesthouse offering clean, comfortable rooms in a quiet neighborhood. Perfect for backpackers and budget travelers exploring Cebu.',
      propertyType: 'GUESTHOUSE',
      address: 'Barangay Gilutongan, Inner Road',
      city: 'Cordova, Cebu',
      latitude: 10.2489,
      longitude: 123.9545,
      contactEmail: 'palmview@gmail.com',
      amenities: ['Free WiFi', 'Parking', 'Air Conditioning', 'Shared Kitchen', 'Terrace', 'Bicycle Rental', 'Tour Desk'],
      images: [
        'https://images.unsplash.com/photo-1587985064135-0366536eab42?w=1200',
        'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200',
        'https://images.unsplash.com/photo-1621293954908-907159247fc8?w=1200'
      ],
      checkInTime: '1:00 PM',
      checkOutTime: '11:00 AM',
      houseRules: 'Respectful behavior required. Keep common areas clean. No loud parties.',
      status: 'PUBLISHED',
      submissionDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
      reviewedDate: new Date(Date.now() - 72 * 24 * 60 * 60 * 1000),
      reviewedById: admin.id,
      ownerId: owner.id,
      roomTypes: [
        {
          name: 'Economy Room',
          description: 'Simple, clean room with basic amenities. Great value for money.',
          bedConfiguration: '1 Double Bed',
          maxAdults: 2,
          maxChildren: 0,
          pricePerNight: 1200,
          availableRooms: 10,
          images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800'],
          amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom', 'Towels']
        }
      ]
    },
    {
      name: 'Maribago Bay Lodge',
      description: 'Modern hotel conveniently located near diving spots and island hopping tours. Features a rooftop pool with panoramic views.',
      propertyType: 'HOTEL',
      address: 'Barangay Cogon, Maribago Road',
      city: 'Cordova, Cebu',
      latitude: 10.2612,
      longitude: 123.9689,
      contactEmail: 'lodge@maribagobay.com',
      amenities: ['Rooftop Pool', 'Restaurant', 'Bar', 'Dive Center', 'Free WiFi', 'Parking', 'Airport Shuttle', 'Laundry Service'],
      images: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200'
      ],
      checkInTime: '3:00 PM',
      checkOutTime: '12:00 PM',
      houseRules: 'Smoking in designated areas only. Pet-friendly with prior notice.',
      status: 'PUBLISHED',
      submissionDate: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
      reviewedDate: new Date(Date.now() - 68 * 24 * 60 * 60 * 1000),
      reviewedById: admin.id,
      ownerId: owner.id,
      roomTypes: [
        {
          name: 'Superior Room',
          description: 'Modern room with city or pool views.',
          bedConfiguration: '1 Queen Bed or 2 Single Beds',
          maxAdults: 2,
          maxChildren: 1,
          pricePerNight: 3200,
          availableRooms: 18,
          images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
          amenities: ['City View', 'Work Desk', 'Mini Fridge', 'Coffee Maker']
        },
        {
          name: 'Deluxe Room',
          description: 'Spacious room with upgraded amenities.',
          bedConfiguration: '1 King Bed',
          maxAdults: 2,
          maxChildren: 2,
          pricePerNight: 4200,
          availableRooms: 12,
          images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'],
          amenities: ['Bay View', 'Balcony', 'Bathtub', 'Premium Toiletries']
        }
      ]
    },
    {
      name: 'Isla Bela Beachfront Resort',
      description: 'Tropical paradise resort offering authentic island experience with modern comforts. Features traditional Filipino architecture blended with contemporary amenities.',
      propertyType: 'RESORT',
      address: 'Barangay Bangbang, Coastal Road',
      city: 'Cordova, Cebu',
      latitude: 10.2571,
      longitude: 123.9656,
      contactEmail: 'info@islabela.com.ph',
      amenities: ['Private Beach', 'Swimming Pool', 'Spa', 'Restaurant', 'Bar', 'Water Sports', 'Free WiFi', 'Wedding Venue', 'Kids Club'],
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200',
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200'
      ],
      checkInTime: '2:00 PM',
      checkOutTime: '12:00 PM',
      houseRules: 'No smoking except in designated areas. Beach towels provided. Respect marine life.',
      status: 'PUBLISHED',
      submissionDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
      reviewedDate: new Date(Date.now() - 62 * 24 * 60 * 60 * 1000),
      reviewedById: admin.id,
      ownerId: owner.id,
      roomTypes: [
        {
          name: 'Beach Villa',
          description: 'Private villa with direct beach access.',
          bedConfiguration: '1 King Bed',
          maxAdults: 2,
          maxChildren: 1,
          pricePerNight: 5500,
          availableRooms: 10,
          images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
          amenities: ['Beach Access', 'Outdoor Shower', 'Private Terrace', 'Mini Bar']
        }
      ]
    },
    {
      name: 'Ocean Breeze Hotel',
      description: 'Contemporary hotel offering comfortable stays with excellent value. Complimentary breakfast included with all bookings.',
      propertyType: 'HOTEL',
      address: 'Poblacion District, Main Highway',
      city: 'Cordova, Cebu',
      latitude: 10.2523,
      longitude: 123.9578,
      contactEmail: 'reservations@oceanbreeze.ph',
      amenities: ['Free WiFi', 'Rooftop Restaurant', 'Parking', 'Airport Transfer', 'Laundry', 'Tour Desk', 'Complimentary Breakfast'],
      images: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200'
      ],
      checkInTime: '2:00 PM',
      checkOutTime: '11:00 AM',
      houseRules: 'Smoking in designated areas only. Children under 5 stay free.',
      status: 'PUBLISHED',
      submissionDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      reviewedDate: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000),
      reviewedById: admin.id,
      ownerId: owner.id,
      roomTypes: [
        {
          name: 'Standard Double',
          description: 'Comfortable room with modern amenities.',
          bedConfiguration: '1 Double Bed',
          maxAdults: 2,
          maxChildren: 1,
          pricePerNight: 2400,
          availableRooms: 16,
          images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800'],
          amenities: ['City View', 'Air Conditioning', 'Cable TV', 'Mini Fridge', 'Free Breakfast']
        }
      ]
    },
    {
      name: 'Cordova Sunset Apartments',
      description: 'Fully-furnished apartments perfect for extended stays and families. Weekly and monthly rates available.',
      propertyType: 'APARTMENT',
      address: 'Barangay Buagsong, Sunset Drive',
      city: 'Cordova, Cebu',
      latitude: 10.2498,
      longitude: 123.9601,
      contactEmail: 'contact@cordovasunset.com',
      amenities: ['Full Kitchen', 'Living Room', 'Balcony', 'Free WiFi', 'Parking', 'Laundry Facility', 'Security', 'Cable TV'],
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200'
      ],
      checkInTime: '2:00 PM',
      checkOutTime: '12:00 PM',
      houseRules: 'Keep apartment clean. No parties. Respect neighbors.',
      status: 'PUBLISHED',
      submissionDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
      reviewedDate: new Date(Date.now() - 53 * 24 * 60 * 60 * 1000),
      reviewedById: admin.id,
      ownerId: owner.id,
      roomTypes: [
        {
          name: 'One Bedroom Apartment',
          description: 'Spacious apartment with bedroom, living room, kitchen.',
          bedConfiguration: '1 Queen Bed + Sofa Bed',
          maxAdults: 3,
          maxChildren: 2,
          pricePerNight: 3800,
          availableRooms: 8,
          images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
          amenities: ['Full Kitchen', 'Dining Area', 'Living Room', 'Washer', 'Balcony']
        },
        {
          name: 'Two Bedroom Apartment',
          description: 'Large family apartment with two bedrooms.',
          bedConfiguration: '1 Queen Bed + 2 Single Beds',
          maxAdults: 4,
          maxChildren: 2,
          pricePerNight: 5200,
          availableRooms: 5,
          images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
          amenities: ['Full Kitchen', 'Dining Area', '2 Bathrooms', 'Living Room']
        }
      ]
    },
    {
      name: 'Tropical Garden Resort',
      description: 'Eco-friendly resort nestled in lush tropical gardens. Experience nature without sacrificing comfort.',
      propertyType: 'RESORT',
      address: 'Barangay Pilipog, Mountain View Road',
      city: 'Cordova, Cebu',
      latitude: 10.2456,
      longitude: 123.9523,
      contactEmail: 'info@tropicalgarden.com',
      amenities: ['Natural Pool', 'Organic Restaurant', 'Yoga Pavilion', 'Garden', 'Nature Trails', 'Free WiFi', 'Massage Service', 'Parking'],
      images: [
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200',
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200',
        'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=1200'
      ],
      checkInTime: '2:00 PM',
      checkOutTime: '11:00 AM',
      houseRules: 'Eco-friendly practices encouraged. Respect wildlife. Quiet hours 9 PM - 7 AM.',
      status: 'PUBLISHED',
      submissionDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      reviewedDate: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000),
      reviewedById: admin.id,
      ownerId: owner.id,
      roomTypes: [
        {
          name: 'Garden Cottage',
          description: 'Charming cottage with garden views.',
          bedConfiguration: '1 Queen Bed',
          maxAdults: 2,
          maxChildren: 1,
          pricePerNight: 3600,
          availableRooms: 12,
          images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800'],
          amenities: ['Garden View', 'Outdoor Seating', 'Natural Ventilation', 'Hammock']
        }
      ]
    },
    {
      name: 'Marina Bay Hotel',
      description: 'Modern waterfront hotel with marina access and water sports facilities. Perfect for adventurous travelers.',
      propertyType: 'HOTEL',
      address: 'Barangay Catarman, Marina Drive',
      city: 'Cordova, Cebu',
      latitude: 10.2667,
      longitude: 123.9745,
      contactEmail: 'marina@bayhotel.com',
      amenities: ['Marina Access', 'Water Sports', 'Equipment Rental', 'Restaurant', 'Bar', 'Free WiFi', 'Parking', 'Boat Tours'],
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200',
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200'
      ],
      checkInTime: '3:00 PM',
      checkOutTime: '12:00 PM',
      houseRules: 'Life jackets required for water activities. Boat owners must register.',
      status: 'PUBLISHED',
      submissionDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      reviewedDate: new Date(Date.now() - 43 * 24 * 60 * 60 * 1000),
      reviewedById: admin.id,
      ownerId: owner.id,
      roomTypes: [
        {
          name: 'Marina View Room',
          description: 'Room with views of the marina and ocean.',
          bedConfiguration: '1 Queen Bed',
          maxAdults: 2,
          maxChildren: 1,
          pricePerNight: 3400,
          availableRooms: 14,
          images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'],
          amenities: ['Marina View', 'Balcony', 'Mini Fridge', 'Coffee Maker']
        }
      ]
    },
    {
      name: 'Coastal Haven Inn',
      description: 'Cozy inn offering personalized service and home-like atmosphere. Family-owned and operated.',
      propertyType: 'GUESTHOUSE',
      address: 'Barangay Dapitan, Seaside Lane',
      city: 'Cordova, Cebu',
      latitude: 10.2512,
      longitude: 123.9589,
      contactEmail: 'stay@coastalhaven.com',
      amenities: ['Free WiFi', 'Garden Terrace', 'Communal Lounge', 'Library', 'Free Breakfast', 'Parking', 'Tour Assistance'],
      images: [
        'https://images.unsplash.com/photo-1587985064135-0366536eab42?w=1200',
        'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200',
        'https://images.unsplash.com/photo-1621293954908-907159247fc8?w=1200'
      ],
      checkInTime: '1:00 PM',
      checkOutTime: '11:00 AM',
      houseRules: 'Remove shoes inside. Breakfast 7-9 AM. Respect other guests.',
      status: 'PUBLISHED',
      submissionDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      reviewedDate: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
      reviewedById: admin.id,
      ownerId: owner.id,
      roomTypes: [
        {
          name: 'Cozy Room',
          description: 'Comfortable room with homey touches.',
          bedConfiguration: '1 Double Bed or 2 Single Beds',
          maxAdults: 2,
          maxChildren: 1,
          pricePerNight: 1800,
          availableRooms: 7,
          images: ['https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800'],
          amenities: ['Garden View', 'Reading Light', 'Work Desk', 'Free Breakfast']
        }
      ]
    },
    {
      name: 'Paradise Cove Beach Resort',
      description: 'Exclusive boutique resort offering ultimate privacy and luxury. Only 20 premium accommodations for intimate and personalized service.',
      propertyType: 'RESORT',
      address: 'Barangay Gabi, Paradise Road',
      city: 'Cordova, Cebu',
      latitude: 10.2589,
      longitude: 123.9678,
      contactEmail: 'reservations@paradisecove.ph',
      amenities: ['Private Beach', 'Infinity Pool', 'Fine Dining', 'Bar & Lounge', 'Spa', 'Concierge', 'Free WiFi', 'Butler Service', 'Water Sports'],
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200',
        'https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=1200',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200'
      ],
      checkInTime: '3:00 PM',
      checkOutTime: '12:00 PM',
      houseRules: 'Adult-oriented resort (18+). Formal attire for dinner service. Advance reservations required.',
      status: 'PUBLISHED',
      submissionDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      reviewedDate: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000),
      reviewedById: admin.id,
      ownerId: owner.id,
      roomTypes: [
        {
          name: 'Pool Villa',
          description: 'Luxury villa with private pool and ocean views.',
          bedConfiguration: '1 King Bed',
          maxAdults: 2,
          maxChildren: 0,
          pricePerNight: 8900,
          availableRooms: 5,
          images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
          amenities: ['Private Pool', 'Ocean View', 'Butler Service', 'Outdoor Living', 'Premium Minibar']
        }
      ]
    },
    {
      name: 'Seascape Residences',
      description: 'Premium serviced apartments with hotel amenities and residential comfort. Ideal for business travelers and extended stays.',
      propertyType: 'APARTMENT',
      address: 'Barangay Alegria, Oceanview Boulevard',
      city: 'Cordova, Cebu',
      latitude: 10.2634,
      longitude: 123.9701,
      contactEmail: 'inquire@seascaperesidences.com',
      amenities: ['Full Kitchen', 'Housekeeping', 'Concierge', 'Gym', 'Business Center', 'Rooftop Lounge', 'Free WiFi', 'Parking', 'Security'],
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200'
      ],
      checkInTime: '3:00 PM',
      checkOutTime: '12:00 PM',
      houseRules: 'No smoking throughout property. Visitor registration required. Professional environment maintained.',
      status: 'PUBLISHED',
      submissionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      reviewedDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      reviewedById: admin.id,
      ownerId: owner.id,
      roomTypes: [
        {
          name: 'Studio Apartment',
          description: 'Modern studio with smart layout.',
          bedConfiguration: '1 Queen Bed',
          maxAdults: 2,
          maxChildren: 0,
          pricePerNight: 4200,
          availableRooms: 12,
          images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
          amenities: ['City View', 'Kitchenette', 'Work Station', 'Smart TV', 'Washer/Dryer']
        },
        {
          name: 'One Bedroom Executive',
          description: 'Spacious executive apartment.',
          bedConfiguration: '1 King Bed',
          maxAdults: 2,
          maxChildren: 1,
          pricePerNight: 5800,
          availableRooms: 8,
          images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
          amenities: ['Ocean View', 'Full Kitchen', 'Living Room', 'Home Office', 'Balcony']
        }
      ]
    },
    {
      name: 'Bamboo Garden Hostel',
      description: 'Social hostel for backpackers and budget travelers. Perfect for solo travelers looking to make friends.',
      propertyType: 'GUESTHOUSE',
      address: 'Barangay Tungasan, Backpacker Street',
      city: 'Cordova, Cebu',
      latitude: 10.2478,
      longitude: 123.9534,
      contactEmail: 'hello@bamboogarden.ph',
      amenities: ['Free WiFi', 'Common Room', 'Outdoor Bar', 'Shared Kitchen', 'Lockers', 'Bicycle Rental', 'Tour Desk', 'BBQ Area'],
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200',
        'https://images.unsplash.com/photo-1587985064135-0366536eab42?w=1200',
        'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200'
      ],
      checkInTime: '2:00 PM',
      checkOutTime: '10:00 AM',
      houseRules: 'Respect others in dorms. Clean up after yourself. Party responsibly.',
      status: 'PUBLISHED',
      submissionDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      reviewedDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
      reviewedById: admin.id,
      ownerId: owner.id,
      roomTypes: [
        {
          name: 'Private Room',
          description: 'Basic private room with shared bathroom.',
          bedConfiguration: '1 Double Bed',
          maxAdults: 2,
          maxChildren: 0,
          pricePerNight: 1400,
          availableRooms: 6,
          images: ['https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800'],
          amenities: ['Fan', 'Shared Bathroom', 'Lockers', 'Reading Light']
        }
      ]
    },
    {
      name: 'Sunset Bay Resort & Spa',
      description: 'All-inclusive resort offering comprehensive vacation packages. Perfect for families and groups seeking hassle-free vacations.',
      propertyType: 'RESORT',
      address: 'Barangay San Miguel, Sunset Beach Road',
      city: 'Cordova, Cebu',
      latitude: 10.2601,
      longitude: 123.9734,
      contactEmail: 'bookings@sunsetbay.com.ph',
      amenities: ['All-Inclusive', 'Multiple Restaurants', 'Bars & Lounges', 'Swimming Pools', 'Spa & Wellness', 'Fitness Center', 'Kids Club', 'Entertainment', 'Water Sports', 'Free WiFi'],
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200'
      ],
      checkInTime: '3:00 PM',
      checkOutTime: '12:00 PM',
      houseRules: 'All-inclusive wristbands required. Proper attire in restaurants. Resort casual dress code.',
      status: 'PUBLISHED',
      submissionDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      reviewedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      reviewedById: admin.id,
      ownerId: owner.id,
      roomTypes: [
        {
          name: 'Resort View Room',
          description: 'Comfortable room with garden or pool views.',
          bedConfiguration: '2 Queen Beds',
          maxAdults: 4,
          maxChildren: 2,
          pricePerNight: 6500,
          availableRooms: 25,
          images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
          amenities: ['Resort View', 'Mini Bar', 'All-Inclusive', 'Safe', 'Balcony']
        },
        {
          name: 'Ocean Front Room',
          description: 'Premium room with direct ocean views.',
          bedConfiguration: '1 King Bed',
          maxAdults: 2,
          maxChildren: 2,
          pricePerNight: 7800,
          availableRooms: 15,
          images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
          amenities: ['Ocean Front', 'Private Balcony', 'Premium Minibar', 'All-Inclusive', 'Beach Access']
        }
      ]
    },
    {
      name: 'Heritage House Cordova',
      description: 'Restored heritage home offering unique cultural accommodation experience. Beautifully preserved traditional Filipino house.',
      propertyType: 'GUESTHOUSE',
      address: 'Poblacion Heritage District',
      city: 'Cordova, Cebu',
      latitude: 10.2545,
      longitude: 123.9590,
      contactEmail: 'heritage@cordovahouse.com',
      amenities: ['Heritage Building', 'Cultural Activities', 'Traditional Meals', 'Library', 'Garden', 'Free WiFi', 'Guided Tours'],
      images: [
        'https://images.unsplash.com/photo-1587985064135-0366536eab42?w=1200',
        'https://images.unsplash.com/photo-1584132005104-4e8f832d7b0c?w=1200',
        'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200'
      ],
      checkInTime: '1:00 PM',
      checkOutTime: '11:00 AM',
      houseRules: 'Respect historical artifacts. Remove footwear inside. Cultural sensitivity appreciated.',
      status: 'PUBLISHED',
      submissionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      reviewedDate: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
      reviewedById: admin.id,
      ownerId: owner.id,
      roomTypes: [
        {
          name: 'Heritage Room',
          description: 'Charming room with antique furniture and traditional decor.',
          bedConfiguration: '1 Queen Bed',
          maxAdults: 2,
          maxChildren: 1,
          pricePerNight: 2600,
          availableRooms: 5,
          images: ['https://images.unsplash.com/photo-1584132005104-4e8f832d7b0c?w=800'],
          amenities: ['Antique Furnishings', 'Cultural Decor', 'Private Bathroom', 'Fan', 'Traditional Meals']
        }
      ]
    }
  ];

  // Create properties with nested room types
  let propertyCount = 0;
  let roomTypeCount = 0;

  for (const propertyData of propertiesData) {
    const { roomTypes, ...propertyInfo } = propertyData;

    const property = await prisma.property.create({
      data: {
        ...propertyInfo,
        roomTypes: {
          create: roomTypes
        }
      },
      include: {
        roomTypes: true
      }
    });

    propertyCount++;
    roomTypeCount += property.roomTypes.length;

    const prices = property.roomTypes.map(rt => rt.pricePerNight);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    console.log(`  Created: ${property.name}`);
    console.log(`    - Type: ${property.propertyType}`);
    console.log(`    - Location: ${property.address}`);
    console.log(`    - Status: ${property.status}`);
    console.log(`    - Room types: ${property.roomTypes.length}`);
    console.log(`    - Price range: ₱${minPrice.toLocaleString()} - ₱${maxPrice.toLocaleString()} per night`);
    console.log('');
  }

  // Display summary
  console.log('Database seeding completed successfully!\n');
  console.log('Summary:');
  console.log(`  Users created: ${createdUsers.length}`);
  console.log(`    - Admin: 1`);
  console.log(`    - Hotel Owner: 1`);
  console.log(`    - Customer: 1`);
  console.log(`  Properties created: ${propertyCount}`);
  console.log(`  Room types created: ${roomTypeCount}`);
  console.log('');
  console.log('All seed data has been successfully inserted!');
  console.log('');
  console.log('Important Information:');
  console.log(`  Admin Email: ${admin.email}`);
  console.log(`  Admin Clerk ID: ${admin.clerkUserId}`);
  console.log(`  All properties are in PUBLISHED status`);
  console.log(`  All properties are located in Cordova, Cebu`);
  console.log(`  Price range: ₱1,200 - ₱8,900 per night`);
  console.log('');
  console.log('You can now:');
  console.log('  1. Run your backend server: npm run dev');
  console.log('  2. View data in Prisma Studio: npm run db:studio');
  console.log('  3. Test API endpoints with seeded data');
  console.log('  4. Search properties via: GET /api/properties/search');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
