# SkyBridge Travels - API Documentation

**Base URL**: `http://localhost:5000/api` (Development)
**Production URL**: `https://your-app.railway.app/api`
**Version**: 1.0.0
**Last Updated**: November 15, 2025

---

## Table of Contents

1. [Authentication](#authentication)
2. [Properties API](#properties-api)
3. [Bookings API](#bookings-api)
4. [Payments API](#payments-api)
5. [Admin API](#admin-api)
6. [Webhooks](#webhooks)
7. [Error Handling](#error-handling)
8. [Response Formats](#response-formats)

---

## Authentication

This API uses **Clerk** for authentication. All protected endpoints require a valid Clerk JWT token in the Authorization header.

### Getting a Clerk Token

**Frontend (React with Clerk):**
```javascript
import { useAuth } from '@clerk/clerk-react';

const { getToken } = useAuth();
const token = await getToken();

const response = await fetch('http://localhost:5000/api/bookings', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**For Testing (Manual):**
1. Open your frontend application
2. Log in with Clerk
3. Open browser DevTools → Network tab
4. Make any authenticated API call
5. Copy the `Authorization` header value from the request

### Authorization Header Format

```
Authorization: Bearer <clerk_jwt_token>
```

### User Roles

- `CUSTOMER` - Default role for all users
- `HOTEL_OWNER` - Users who submit properties
- `ADMIN` - System administrators

**Note**: Role is automatically upgraded to `HOTEL_OWNER` when a user creates their first property.

---

## Properties API

### Search Properties

Search and filter published properties.

**Endpoint**: `GET /api/properties/search`
**Authentication**: None (Public)
**Role Required**: None

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| checkIn | string | No | Check-in date (YYYY-MM-DD) | `2025-01-15` |
| checkOut | string | No | Check-out date (YYYY-MM-DD) | `2025-01-17` |
| adults | number | No | Number of adults | `2` |
| children | number | No | Number of children | `1` |
| minPrice | number | No | Minimum price per night | `1000` |
| maxPrice | number | No | Maximum price per night | `5000` |
| propertyType | string | No | Property type (HOTEL, RESORT, APARTMENT, GUESTHOUSE) | `HOTEL` |
| amenities | string | No | Comma-separated amenity list | `WiFi,Pool,Parking` |

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/properties/search?propertyType=HOTEL&minPrice=1500&maxPrice=3500&amenities=WiFi,Pool"
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "clq1234567890abcdef",
      "ownerId": "user_abc123",
      "name": "Cebu Seaside Resort",
      "description": "Luxury beachfront resort in Cordova...",
      "propertyType": "RESORT",
      "address": "123 Seaside Drive, Cordova",
      "city": "Cordova, Cebu",
      "latitude": 10.2554,
      "longitude": 123.9631,
      "contactEmail": "info@cebuseaside.com",
      "amenities": ["WiFi", "Pool", "Restaurant", "Beach Access"],
      "images": [
        "https://res.cloudinary.com/.../image1.jpg",
        "https://res.cloudinary.com/.../image2.jpg"
      ],
      "checkInTime": "14:00",
      "checkOutTime": "12:00",
      "houseRules": "No smoking. Pets not allowed.",
      "status": "PUBLISHED",
      "submissionDate": "2024-12-15T09:00:00.000Z",
      "reviewedDate": "2024-12-16T14:30:00.000Z",
      "reviewedById": "user_admin456",
      "rejectionReason": null,
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-05T15:30:00.000Z",
      "roomTypes": [
        {
          "id": "clr1234567890abcdef",
          "propertyId": "clq1234567890abcdef",
          "name": "Deluxe Ocean View",
          "description": "Spacious room with ocean view",
          "bedConfiguration": "1 King Bed",
          "maxAdults": 2,
          "maxChildren": 2,
          "pricePerNight": 3500,
          "availableRooms": 10,
          "images": ["https://res.cloudinary.com/.../room1.jpg"],
          "amenities": ["WiFi", "TV", "Mini Bar"],
          "createdAt": "2025-01-01T10:00:00.000Z",
          "updatedAt": "2025-01-01T10:00:00.000Z"
        }
      ],
      "owner": {
        "id": "user_abc123",
        "firstName": "Juan",
        "lastName": "Dela Cruz",
        "email": "juan@example.com"
      }
    }
  ]
}
```

---

### Get Property by ID

Get detailed information about a specific property.

**Endpoint**: `GET /api/properties/:id`
**Authentication**: None (Public)
**Role Required**: None

**Path Parameters:**
- `id` (string, required) - Property ID

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/properties/clq1234567890abcdef"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clq1234567890abcdef",
    "ownerId": "user_abc123",
    "name": "Cebu Seaside Resort",
    "description": "Luxury beachfront resort...",
    "propertyType": "RESORT",
    "address": "123 Seaside Drive, Cordova",
    "city": "Cordova, Cebu",
    "latitude": 10.2554,
    "longitude": 123.9631,
    "contactEmail": "info@cebuseaside.com",
    "amenities": ["WiFi", "Pool", "Restaurant"],
    "images": ["https://..."],
    "checkInTime": "14:00",
    "checkOutTime": "12:00",
    "houseRules": "No smoking",
    "status": "PUBLISHED",
    "submissionDate": "2024-12-15T09:00:00.000Z",
    "reviewedDate": "2024-12-16T14:30:00.000Z",
    "reviewedById": "user_admin456",
    "rejectionReason": null,
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-01-05T15:30:00.000Z",
    "roomTypes": [
      {
        "id": "clr1234567890abcdef",
        "propertyId": "clq1234567890abcdef",
        "name": "Deluxe Ocean View",
        "description": "Spacious room with ocean view",
        "bedConfiguration": "1 King Bed",
        "maxAdults": 2,
        "maxChildren": 2,
        "pricePerNight": 3500,
        "availableRooms": 10,
        "images": ["https://..."],
        "amenities": ["WiFi", "TV", "Mini Bar"],
        "createdAt": "2025-01-01T10:00:00.000Z",
        "updatedAt": "2025-01-01T10:00:00.000Z"
      }
    ],
    "owner": {
      "id": "user_abc123",
      "firstName": "Juan",
      "lastName": "Dela Cruz",
      "email": "juan@example.com"
    }
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Property not found"
}
```

---

### Create Property

Submit a new property for admin approval.

**Endpoint**: `POST /api/properties`
**Authentication**: Required
**Role Required**: `HOTEL_OWNER` (automatically assigned on first property creation)

**Request Body:**
```json
{
  "name": "Palm View Inn",
  "description": "Cozy guesthouse perfect for budget travelers. Located in the heart of Cordova with easy access to beaches and diving spots. Clean, comfortable rooms with all essential amenities.",
  "propertyType": "GUESTHOUSE",
  "address": "456 Palm Street, Barangay Poblacion, Cordova",
  "latitude": 10.2489,
  "longitude": 123.9521,
  "contactEmail": "contact@palmviewinn.com",
  "amenities": ["WiFi", "Parking", "Air Conditioning", "24/7 Reception"],
  "images": [
    "https://res.cloudinary.com/demo/image/upload/property1.jpg",
    "https://res.cloudinary.com/demo/image/upload/property2.jpg",
    "https://res.cloudinary.com/demo/image/upload/property3.jpg"
  ],
  "checkInTime": "14:00",
  "checkOutTime": "11:00",
  "houseRules": "No smoking inside rooms. Quiet hours from 10 PM to 7 AM. Guests must present valid ID upon check-in.",
  "roomTypes": [
    {
      "name": "Standard Room",
      "description": "Comfortable room with queen bed",
      "bedConfiguration": "1 Queen Bed",
      "maxAdults": 2,
      "maxChildren": 1,
      "pricePerNight": 1200,
      "availableRooms": 8,
      "amenities": ["WiFi", "TV", "Air Conditioning"]
    }
  ]
}
```

**Request Body Schema:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | Yes | Min 3 chars | Property name |
| description | string | Yes | Min 50 chars | Detailed description |
| propertyType | string | Yes | Enum: HOTEL, RESORT, APARTMENT, GUESTHOUSE | Type of property |
| address | string | Yes | Min 10 chars | Full street address |
| latitude | number | Yes | -90 to 90 | GPS latitude coordinate |
| longitude | number | Yes | -180 to 180 | GPS longitude coordinate |
| contactEmail | string | Yes | Valid email | Contact email |
| amenities | array | Yes | Min 1 item | Array of amenity strings |
| images | array | Yes | 3-8 HTTPS URLs | Array of image URLs |
| checkInTime | string | Yes | - | Check-in time (e.g., "14:00") |
| checkOutTime | string | Yes | - | Check-out time (e.g., "12:00") |
| houseRules | string | No | - | Property rules and policies |
| roomTypes | array | Yes | 1-2 room types | Array of room type objects |

**Room Type Schema:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | Yes | Min 3 chars | Room type name |
| description | string | No | - | Room description |
| bedConfiguration | string | Yes | Min 1 char | Bed setup (e.g., "1 King Bed") |
| maxAdults | number | Yes | Min 1 | Maximum adults allowed |
| maxChildren | number | Yes | Min 0 | Maximum children allowed |
| pricePerNight | number | Yes | Positive number | Price per night |
| availableRooms | number | Yes | Min 1 | Number of available rooms |
| images | array | No | Valid URLs | Room-specific images |
| amenities | array | No | - | Room-specific amenities |

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/properties" \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Palm View Inn",
    "description": "Cozy guesthouse perfect for budget travelers...",
    "propertyType": "GUESTHOUSE",
    "address": "456 Palm Street, Cordova",
    "latitude": 10.2489,
    "longitude": 123.9521,
    "contactEmail": "contact@palmviewinn.com",
    "amenities": ["WiFi", "Parking"],
    "images": ["https://...", "https://...", "https://..."],
    "checkInTime": "14:00",
    "checkOutTime": "11:00",
    "roomTypes": [...]
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Property submitted for review",
  "data": {
    "id": "clq9876543210zyxwvu",
    "ownerId": "user_owner123",
    "name": "Palm View Inn",
    "description": "Cozy guesthouse perfect for budget travelers. Located in the heart of Cordova with easy access to beaches and diving spots. Clean, comfortable rooms with all essential amenities.",
    "propertyType": "GUESTHOUSE",
    "address": "456 Palm Street, Barangay Poblacion, Cordova",
    "city": "Cordova, Cebu",
    "latitude": 10.2489,
    "longitude": 123.9521,
    "contactEmail": "contact@palmviewinn.com",
    "amenities": ["WiFi", "Parking", "Air Conditioning", "24/7 Reception"],
    "images": [
      "https://res.cloudinary.com/demo/image/upload/property1.jpg",
      "https://res.cloudinary.com/demo/image/upload/property2.jpg",
      "https://res.cloudinary.com/demo/image/upload/property3.jpg"
    ],
    "checkInTime": "14:00",
    "checkOutTime": "11:00",
    "houseRules": "No smoking inside rooms. Quiet hours from 10 PM to 7 AM. Guests must present valid ID upon check-in.",
    "status": "PENDING",
    "submissionDate": "2025-01-10T09:30:00.000Z",
    "reviewedDate": null,
    "reviewedById": null,
    "rejectionReason": null,
    "createdAt": "2025-01-10T09:30:00.872Z",
    "updatedAt": "2025-01-10T09:30:00.872Z",
    "roomTypes": [
      {
        "id": "clr9876543210room01",
        "propertyId": "clq9876543210zyxwvu",
        "name": "Standard Room",
        "description": "Comfortable room with queen bed",
        "bedConfiguration": "1 Queen Bed",
        "maxAdults": 2,
        "maxChildren": 1,
        "pricePerNight": 1200,
        "availableRooms": 8,
        "images": [],
        "amenities": ["WiFi", "TV", "Air Conditioning"],
        "createdAt": "2025-01-10T09:30:00.872Z",
        "updatedAt": "2025-01-10T09:30:00.872Z"
      }
    ]
  }
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "description",
      "message": "Description must be at least 50 characters"
    },
    {
      "field": "images",
      "message": "At least 3 images are required"
    }
  ]
}
```

**Notes:**
- Property status is set to `PENDING` upon creation
- Property will not appear in public search until admin approves it
- Confirmation email is sent to property owner
- User role is automatically upgraded to `HOTEL_OWNER`
- City is automatically set to "Cordova, Cebu"
- Images must be uploaded to Cloudinary by frontend before submission

---

### Update Property

Update an existing property. Requires re-approval by admin.

**Endpoint**: `PUT /api/properties/:id`
**Authentication**: Required
**Role Required**: `HOTEL_OWNER` (must be property owner)

**Path Parameters:**
- `id` (string, required) - Property ID

**Request Body:** Same as [Create Property](#create-property)

**Example Request:**
```bash
curl -X PUT "http://localhost:5000/api/properties/clq9876543210zyxwvu" \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Palm View Inn - Updated",
    "description": "Updated description...",
    ...
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Property updated successfully. Re-submitted for approval.",
  "data": {
    "id": "clq9876543210zyxwvu",
    "ownerId": "user_owner123",
    "name": "Palm View Inn - Updated",
    "description": "Updated description with more details about the property...",
    "propertyType": "GUESTHOUSE",
    "address": "456 Palm Street, Barangay Poblacion, Cordova",
    "city": "Cordova, Cebu",
    "latitude": 10.2489,
    "longitude": 123.9521,
    "contactEmail": "contact@palmviewinn.com",
    "amenities": ["WiFi", "Parking", "Air Conditioning", "24/7 Reception"],
    "images": [
      "https://res.cloudinary.com/demo/image/upload/property1.jpg",
      "https://res.cloudinary.com/demo/image/upload/property2.jpg",
      "https://res.cloudinary.com/demo/image/upload/property3.jpg"
    ],
    "checkInTime": "14:00",
    "checkOutTime": "11:00",
    "houseRules": "No smoking inside rooms. Quiet hours from 10 PM to 7 AM.",
    "status": "PENDING",
    "submissionDate": "2025-01-10T09:30:00.000Z",
    "reviewedDate": null,
    "reviewedById": null,
    "rejectionReason": null,
    "createdAt": "2025-01-10T09:30:00.872Z",
    "updatedAt": "2025-01-12T14:20:00.000Z",
    "roomTypes": [
      {
        "id": "clr9876543210room01",
        "propertyId": "clq9876543210zyxwvu",
        "name": "Standard Room",
        "description": "Comfortable room with queen bed",
        "bedConfiguration": "1 Queen Bed",
        "maxAdults": 2,
        "maxChildren": 1,
        "pricePerNight": 1200,
        "availableRooms": 8,
        "images": [],
        "amenities": ["WiFi", "TV", "Air Conditioning"],
        "createdAt": "2025-01-10T09:30:00.872Z",
        "updatedAt": "2025-01-12T14:20:00.000Z"
      }
    ]
  }
}
```

**Authorization Error (403):**
```json
{
  "success": false,
  "error": "You do not have permission to update this property"
}
```

**Notes:**
- Only the property owner can update their property
- Status is reset to `PENDING` after update (requires re-approval)
- All room types are replaced (not merged)
- Property will be removed from public search until re-approved

---

### Get Owner's Properties

Get all properties belonging to the authenticated hotel owner.

**Endpoint**: `GET /api/properties/owner/my-properties`
**Authentication**: Required
**Role Required**: `HOTEL_OWNER`

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/properties/owner/my-properties" \
  -H "Authorization: Bearer <clerk_token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "clq1234...",
      "ownerId": "user_owner123",
      "name": "Palm View Inn",
      "description": "Cozy guesthouse perfect for budget travelers...",
      "propertyType": "GUESTHOUSE",
      "address": "456 Palm Street, Barangay Poblacion, Cordova",
      "city": "Cordova, Cebu",
      "latitude": 10.2489,
      "longitude": 123.9521,
      "contactEmail": "contact@palmviewinn.com",
      "amenities": ["WiFi", "Parking", "Air Conditioning", "24/7 Reception"],
      "images": [
        "https://res.cloudinary.com/demo/image/upload/property1.jpg",
        "https://res.cloudinary.com/demo/image/upload/property2.jpg",
        "https://res.cloudinary.com/demo/image/upload/property3.jpg"
      ],
      "checkInTime": "14:00",
      "checkOutTime": "11:00",
      "houseRules": "No smoking inside rooms. Quiet hours from 10 PM to 7 AM.",
      "status": "PUBLISHED",
      "submissionDate": "2025-01-10T09:30:00.000Z",
      "reviewedDate": "2025-01-11T16:45:00.000Z",
      "reviewedById": "user_admin456",
      "rejectionReason": null,
      "createdAt": "2025-01-10T09:30:00.872Z",
      "updatedAt": "2025-01-11T16:45:00.000Z",
      "roomTypes": [
        {
          "id": "clr1234...",
          "propertyId": "clq1234...",
          "name": "Standard Room",
          "description": "Comfortable room with queen bed",
          "bedConfiguration": "1 Queen Bed",
          "maxAdults": 2,
          "maxChildren": 1,
          "pricePerNight": 1200,
          "availableRooms": 8,
          "images": [],
          "amenities": ["WiFi", "TV", "Air Conditioning"],
          "createdAt": "2025-01-10T09:30:00.872Z",
          "updatedAt": "2025-01-10T09:30:00.872Z"
        }
      ]
    },
    { "..." },
    { "..." }
  ]
}
```

**Note:** Each property object in the array has the same complete structure as shown in the first item.

---

## Bookings API

### Create Booking

Create a new booking for a property.

**Endpoint**: `POST /api/bookings`
**Authentication**: Required
**Role Required**: Any authenticated user

**Request Body:**
```json
{
  "propertyId": "clq1234567890abcdef",
  "roomTypeId": "clr1234567890abcdef",
  "checkInDate": "2025-02-15",
  "checkOutDate": "2025-02-17",
  "adults": 2,
  "children": 1
}
```

**Request Body Schema:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| propertyId | string | Yes | Non-empty | Property ID |
| roomTypeId | string | Yes | Non-empty | Room type ID |
| checkInDate | string | Yes | YYYY-MM-DD or ISO 8601 | Check-in date |
| checkOutDate | string | Yes | YYYY-MM-DD or ISO 8601 | Check-out date (must be after check-in) |
| adults | number | Yes | 1-10 | Number of adults |
| children | number | No | 0-10 (default: 0) | Number of children |

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/bookings" \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "clq1234567890abcdef",
    "roomTypeId": "clr1234567890abcdef",
    "checkInDate": "2025-02-15",
    "checkOutDate": "2025-02-17",
    "adults": 2,
    "children": 1
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cls1234567890booking",
    "bookingId": "GEM-A1B2C3",
    "userId": "user_abc123",
    "propertyId": "clq1234567890abcdef",
    "roomTypeId": "clr1234567890abcdef",
    "checkInDate": "2025-02-15T00:00:00.000Z",
    "checkOutDate": "2025-02-17T00:00:00.000Z",
    "numberOfNights": 2,
    "adults": 2,
    "children": 1,
    "subtotal": 7000,
    "taxesAndFees": 840,
    "totalAmount": 7840,
    "bookingStatus": "PENDING",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z",
    "property": {
      "name": "Cebu Seaside Resort",
      "address": "123 Seaside Drive, Cordova",
      "city": "Cordova, Cebu",
      "contactEmail": "reservations@cebuseaside.com",
      "checkInTime": "2:00 PM",
      "checkOutTime": "12:00 PM"
    },
    "roomType": {
      "name": "Deluxe Ocean View",
      "bedConfiguration": "1 King Bed",
      "maxAdults": 2,
      "maxChildren": 1,
      "pricePerNight": 3500,
      "amenities": ["Ocean View", "Balcony", "Mini Bar", "Safe", "Coffee Maker"]
    }
  }
}
```

**Availability Error (400):**
```json
{
  "success": false,
  "error": "No rooms available for selected dates"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "checkOutDate",
      "message": "Check-out date must be after check-in date",
      "code": "custom"
    }
  ]
}
```

**Notes:**
- Booking status is set to `PENDING` upon creation
- Pricing is automatically calculated (subtotal + 12% tax)
- Unique booking ID is generated (format: GEM-XXXXXX)
- User is automatically created in database if first booking
- Availability is checked for date overlap
- Payment record is created with status `PENDING`

---

### Get My Bookings

Get all bookings for the authenticated user.

**Endpoint**: `GET /api/bookings/my-bookings`
**Authentication**: Required
**Role Required**: Any authenticated user

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/bookings/my-bookings" \
  -H "Authorization: Bearer <clerk_token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "cls1234...",
      "bookingId": "GEM-A1B2C3",
      "userId": "cmhzt1o130000lbcyphi0suyx",
      "propertyId": "cmhz2lqyy0004oldhpw1kf3y0",
      "roomTypeId": "cmhz2lqyz0005oldh8fxchap0",
      "checkInDate": "2025-02-15T00:00:00.000Z",
      "checkOutDate": "2025-02-17T00:00:00.000Z",
      "numberOfNights": 2,
      "adults": 2,
      "children": 1,
      "subtotal": 7000,
      "taxesAndFees": 840,
      "totalAmount": 7840,
      "bookingStatus": "CONFIRMED",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z",
      "property": {
        "name": "Cebu Seaside Resort & Spa",
        "address": "123 Seaside Drive, Cordova",
        "city": "Cordova, Cebu",
        "contactEmail": "reservations@cebuseaside.com",
        "checkInTime": "2:00 PM",
        "checkOutTime": "12:00 PM"
      },
      "roomType": {
        "name": "Deluxe Ocean View",
        "bedConfiguration": "1 King Bed",
        "maxAdults": 2,
        "maxChildren": 1,
        "pricePerNight": 3500,
        "amenities": ["Ocean View", "Balcony", "Mini Bar", "Safe", "Coffee Maker"]
      },
      "payment": {
        "xenditInvoiceId": "invoice_abc123",
        "amount": 7840,
        "paymentMethod": "Credit Card",
        "paymentStatus": "PAID",
        "transactionDate": "2025-01-15T10:35:00.000Z"
      }
    },
    {...}
  ]
}
```

---

### Get Booking by ID

Get details of a specific booking.

**Endpoint**: `GET /api/bookings/:id`
**Authentication**: Required
**Role Required**: Booking owner or `ADMIN`

**Path Parameters:**
- `id` (string, required) - Booking ID

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/bookings/cls1234567890booking" \
  -H "Authorization: Bearer <clerk_token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cls1234567890booking",
    "bookingId": "GEM-A1B2C3",
    "userId": "cmhzt1o130000lbcyphi0suyx",
    "propertyId": "cmhz2lqyy0004oldhpw1kf3y0",
    "roomTypeId": "cmhz2lqyz0005oldh8fxchap0",
    "checkInDate": "2025-02-15T00:00:00.000Z",
    "checkOutDate": "2025-02-17T00:00:00.000Z",
    "numberOfNights": 2,
    "adults": 2,
    "children": 1,
    "subtotal": 7000,
    "taxesAndFees": 840,
    "totalAmount": 7840,
    "bookingStatus": "CONFIRMED",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z",
    "property": {
      "name": "Cebu Seaside Resort & Spa",
      "address": "123 Seaside Drive, Cordova",
      "city": "Cordova, Cebu",
      "contactEmail": "reservations@cebuseaside.com",
      "checkInTime": "2:00 PM",
      "checkOutTime": "12:00 PM"
    },
    "roomType": {
      "name": "Deluxe Ocean View",
      "bedConfiguration": "1 King Bed",
      "maxAdults": 2,
      "maxChildren": 1,
      "pricePerNight": 3500,
      "amenities": ["Ocean View", "Balcony", "Mini Bar", "Safe", "Coffee Maker"]
    },
    "user": {
      "email": "customer@example.com",
      "firstName": "Juan",
      "lastName": "Dela Cruz"
    },
    "payment": {
      "xenditInvoiceId": "invoice_abc123",
      "amount": 7840,
      "paymentMethod": "Credit Card",
      "paymentStatus": "PAID",
      "transactionDate": "2025-01-15T10:35:00.000Z"
    }
  }
}
```

**Authorization Error (403):**
```json
{
  "success": false,
  "error": "Forbidden: You do not have access to this booking"
}
```

---

### Cancel Booking

Cancel an existing booking (must be at least 7 days before check-in).

**Endpoint**: `PATCH /api/bookings/:id/cancel`
**Authentication**: Required
**Role Required**: Booking owner

**Path Parameters:**
- `id` (string, required) - Booking ID

**Request Body:**
```json
{
  "reason": "Change of travel plans" // Optional
}
```

**Example Request:**
```bash
curl -X PATCH "http://localhost:5000/api/bookings/cls1234567890booking/cancel" \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Change of travel plans"}'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": "cls1234567890booking",
    "bookingId": "GEM-A1B2C3",
    "userId": "cmhzt1o130000lbcyphi0suyx",
    "propertyId": "cmhz2lqyy0004oldhpw1kf3y0",
    "roomTypeId": "cmhz2lqyz0005oldh8fxchap0",
    "checkInDate": "2025-02-15T00:00:00.000Z",
    "checkOutDate": "2025-02-17T00:00:00.000Z",
    "numberOfNights": 2,
    "adults": 2,
    "children": 1,
    "subtotal": 7000,
    "taxesAndFees": 840,
    "totalAmount": 7840,
    "bookingStatus": "CANCELLED",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-16T09:15:00.000Z",
    "property": {
      "name": "Cebu Seaside Resort & Spa",
      "address": "123 Seaside Drive, Cordova",
      "city": "Cordova, Cebu",
      "contactEmail": "reservations@cebuseaside.com",
      "checkInTime": "2:00 PM",
      "checkOutTime": "12:00 PM"
    },
    "roomType": {
      "name": "Deluxe Ocean View",
      "bedConfiguration": "1 King Bed",
      "maxAdults": 2,
      "maxChildren": 1,
      "pricePerNight": 3500,
      "amenities": ["Ocean View", "Balcony", "Mini Bar", "Safe", "Coffee Maker"]
    },
    "payment": {
      "xenditInvoiceId": "invoice_abc123",
      "amount": 7840,
      "paymentMethod": "Credit Card",
      "paymentStatus": "PAID",
      "transactionDate": "2025-01-15T10:35:00.000Z"
    }
  }
}
```

**Cancellation Policy Error (400):**
```json
{
  "success": false,
  "error": "Cancellation not allowed",
  "message": "Bookings can only be cancelled at least 7 days before check-in date"
}
```

**Notes:**
- Cancellation is only allowed if check-in date is at least 7 days in the future
- Booking status is updated to `CANCELLED`
- Cancelled bookings no longer count towards room availability

---

## Payments API

### Create Payment Invoice

Create a Xendit payment invoice for a booking.

**Endpoint**: `POST /api/payments/create-invoice`
**Authentication**: Required
**Role Required**: Booking owner

**Request Body:**
```json
{
  "bookingId": "cls1234567890booking"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/payments/create-invoice" \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "cls1234567890booking"}'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment invoice created successfully",
  "data": {
    "invoiceUrl": "https://checkout-staging.xendit.co/web/6918230626d6bc37164c1fa6",
    "invoiceId": "6918230626d6bc37164c1fa6",
    "amount": 7840,
    "expiryDate": "2025-01-16T10:30:00.000Z",
    "bookingId": "GEM-A1B2C3",
    "propertyName": "Cebu Seaside Resort & Spa",
    "roomType": "Deluxe Ocean View",
    "checkInDate": "2025-02-15T00:00:00.000Z",
    "checkOutDate": "2025-02-17T00:00:00.000Z"
  }
}
```

**Error Response (400) - Invoice Already Exists:**
```json
{
  "success": false,
  "error": "An invoice already exists for this booking",
  "statusCode": 400,
  "timestamp": "2025-11-16T12:34:56.789Z"
}
```

**Notes:**
- Redirects user to Xendit hosted payment page
- Supports multiple payment methods: Credit/Debit Card, GCash, Maya, Bank Transfer, 7-Eleven OTC
- Invoice expires after 24 hours
- Payment status is tracked via webhook
- Frontend should redirect user to `invoiceUrl`

---

### Xendit Webhook

**Internal endpoint - called by Xendit only**

**Endpoint**: `POST /api/payments/webhook`
**Authentication**: None (Xendit verifies via callback token)
**Role Required**: None

**Webhook Payload (from Xendit):**
```json
{
  "id": "62d4a8f8e123456789abcdef",
  "external_id": "cls1234567890booking",
  "status": "PAID",
  "paid_amount": 7840,
  "payment_method": "CREDIT_CARD",
  "paid_at": "2025-01-15T10:35:00.000Z"
}
```

**Webhook Actions:**
- Updates Payment.paymentStatus to `PAID`
- Updates Booking.bookingStatus to `CONFIRMED`
- Sends booking confirmation email to customer
- Returns 200 status to Xendit

**Success Response (200):**
```json
{
  "received": true
}
```

**Notes:**
- This endpoint is publicly accessible (no authentication)
- Xendit must be configured with webhook URL in dashboard
- Webhook URL format: `https://your-api.com/api/payments/webhook`
- Always returns 200 to prevent Xendit retries

---

## Admin API

All admin endpoints require `ADMIN` role.

### Get Pending Properties

Get all properties pending admin review.

**Endpoint**: `GET /api/admin/properties/pending`
**Authentication**: Required
**Role Required**: `ADMIN`

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/properties/pending" \
  -H "Authorization: Bearer <admin_clerk_token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "cmhzl6a1k0001pl1ibc98t7f9",
      "ownerId": "cmhzkxcv10002nwr6bcprlqpg",
      "name": "Palm View Inn",
      "description": "Cozy guesthouse perfect for budget travelers. Located in the heart of Cordova with easy access to beaches and diving spots.",
      "propertyType": "GUESTHOUSE",
      "address": "456 Palm Street, Barangay Poblacion, Cordova",
      "city": "Cordova, Cebu",
      "latitude": 10.2489,
      "longitude": 123.9521,
      "contactEmail": "contact@palmviewinn.com",
      "amenities": ["WiFi", "Parking", "Air Conditioning", "24/7 Reception"],
      "images": [
        "https://res.cloudinary.com/demo/image/upload/property1.jpg",
        "https://res.cloudinary.com/demo/image/upload/property2.jpg"
      ],
      "checkInTime": "14:00",
      "checkOutTime": "11:00",
      "houseRules": "No smoking inside rooms. Quiet hours from 10 PM to 7 AM.",
      "status": "PENDING",
      "submissionDate": "2025-01-10T09:30:00.000Z",
      "reviewedDate": null,
      "reviewedById": null,
      "rejectionReason": null,
      "createdAt": "2025-01-10T09:30:00.000Z",
      "updatedAt": "2025-01-10T09:30:00.000Z",
      "owner": {
        "id": "cmhzkxcv10002nwr6bcprlqpg",
        "email": "maria@example.com",
        "firstName": "Maria",
        "lastName": "Santos"
      },
      "roomTypes": [
        {
          "id": "cmhzl6a1k0002pl1iyfif5nbq",
          "propertyId": "cmhzl6a1k0001pl1ibc98t7f9",
          "name": "Standard Room",
          "description": "Comfortable room with queen bed",
          "bedConfiguration": "1 Queen Bed",
          "maxAdults": 2,
          "maxChildren": 1,
          "pricePerNight": 1200,
          "availableRooms": 8,
          "images": [],
          "amenities": ["WiFi", "TV", "Air Conditioning"],
          "createdAt": "2025-01-10T09:30:00.000Z",
          "updatedAt": "2025-01-10T09:30:00.000Z"
        }
      ]
    },
    {...}
  ]
}
```

**Notes:**
- Properties are ordered by submission date (oldest first)
- Includes full property details for review
- Only shows properties with status `PENDING`

---

### Get All Properties

Get all properties (any status) for admin management.

**Endpoint**: `GET /api/admin/properties`
**Authentication**: Required
**Role Required**: `ADMIN`

**Query Parameters:**
- `status` (string, optional) - Filter by status (PENDING, APPROVED, REJECTED, PUBLISHED, SUSPENDED)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/properties?status=PUBLISHED" \
  -H "Authorization: Bearer <admin_clerk_token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 15,
  "data": [...]
}
```

---

### Approve Property

Approve a pending property submission.

**Endpoint**: `PATCH /api/admin/properties/:id/approve`
**Authentication**: Required
**Role Required**: `ADMIN`

**Path Parameters:**
- `id` (string, required) - Property ID

**Example Request:**
```bash
curl -X PATCH "http://localhost:5000/api/admin/properties/clq9876.../approve" \
  -H "Authorization: Bearer <admin_clerk_token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Property approved successfully",
  "data": {
    "id": "cmhzl6a1k0001pl1ibc98t7f9",
    "ownerId": "cmhzkxcv10002nwr6bcprlqpg",
    "name": "Palm View Inn",
    "description": "Cozy guesthouse perfect for budget travelers. Located in the heart of Cordova with easy access to beaches and diving spots. Clean, comfortable rooms with all essential amenities.",
    "propertyType": "GUESTHOUSE",
    "address": "456 Palm Street, Barangay Poblacion, Cordova",
    "city": "Cordova, Cebu",
    "latitude": 10.2489,
    "longitude": 123.9521,
    "contactEmail": "contact@palmviewinn.com",
    "amenities": [
      "WiFi",
      "Parking",
      "Air Conditioning",
      "24/7 Reception"
    ],
    "images": [
      "https://res.cloudinary.com/demo/image/upload/property1.jpg",
      "https://res.cloudinary.com/demo/image/upload/property2.jpg",
      "https://res.cloudinary.com/demo/image/upload/property3.jpg"
    ],
    "checkInTime": "14:00",
    "checkOutTime": "11:00",
    "houseRules": "No smoking inside rooms. Quiet hours from 10 PM to 7 AM. Guests must present valid ID upon check-in.",
    "status": "PUBLISHED",
    "submissionDate": "2025-11-15T01:06:30.870Z",
    "reviewedDate": "2025-11-15T07:51:45.276Z",
    "reviewedById": "cmhzkxcv10002nwr6bcprlqpg",
    "rejectionReason": null,
    "createdAt": "2025-11-15T01:06:30.872Z",
    "updatedAt": "2025-11-15T07:51:45.277Z",
    "owner": {
      "id": "cmhzkxcv10002nwr6bcprlqpg",
      "email": "lourdenbaydal13@gmail.com",
      "firstName": "BAYDAL",
      "lastName": "LOURDEN"
    },
    "roomTypes": [
      {
        "id": "cmhzl6a1k0002pl1iyfif5nbq",
        "propertyId": "cmhzl6a1k0001pl1ibc98t7f9",
        "name": "Standard Room",
        "description": "Comfortable room with queen bed",
        "bedConfiguration": "1 Queen Bed",
        "maxAdults": 2,
        "maxChildren": 1,
        "pricePerNight": 1200,
        "availableRooms": 8,
        "images": [],
        "amenities": [
          "WiFi",
          "TV",
          "Air Conditioning"
        ],
        "createdAt": "2025-11-15T01:06:30.872Z",
        "updatedAt": "2025-11-15T01:06:30.872Z"
      }
    ]
  }
}
```

**Notes:**
- Property status changes to `PUBLISHED`
- Property becomes visible in public search
- Owner receives approval email
- Reviewed date and admin ID are recorded

---

### Reject Property

Reject a property submission with feedback.

**Endpoint**: `PATCH /api/admin/properties/:id/reject`
**Authentication**: Required
**Role Required**: `ADMIN`

**Path Parameters:**
- `id` (string, required) - Property ID

**Request Body:**
```json
{
  "rejectionReason": "Images do not meet quality standards. Please upload high-resolution photos showing the property exterior, rooms, and amenities. Descriptions should be more detailed."
}
```

**Example Request:**
```bash
curl -X PATCH "http://localhost:5000/api/admin/properties/clq9876.../reject" \
  -H "Authorization: Bearer <admin_clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{"rejectionReason": "Images do not meet quality standards..."}'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Property rejected successfully",
  "data": {
    "id": "cmhzt2b7j0002lbcy2pz3cycn",
    "ownerId": "cmhzt1o130000lbcyphi0suyx",
    "name": "Palm View Inn - lourdenb15",
    "description": "Cozy guesthouse perfect for budget travelers. Located in the heart of Cordova with easy access to beaches and diving spots. Clean, comfortable rooms with all essential amenities.",
    "propertyType": "GUESTHOUSE",
    "address": "456 Palm Street, Barangay Poblacion, Cordova",
    "city": "Cordova, Cebu",
    "latitude": 10.2489,
    "longitude": 123.9521,
    "contactEmail": "contact@palmviewinn.com",
    "amenities": [
      "WiFi",
      "Parking",
      "Air Conditioning",
      "24/7 Reception"
    ],
    "images": [
      "https://res.cloudinary.com/demo/image/upload/property1.jpg",
      "https://res.cloudinary.com/demo/image/upload/property2.jpg",
      "https://res.cloudinary.com/demo/image/upload/property3.jpg"
    ],
    "checkInTime": "14:00",
    "checkOutTime": "11:00",
    "houseRules": "No smoking inside rooms. Quiet hours from 10 PM to 7 AM. Guests must present valid ID upon check-in.",
    "status": "REJECTED",
    "submissionDate": "2025-11-15T04:47:22.686Z",
    "reviewedDate": "2025-11-15T08:00:26.342Z",
    "reviewedById": "cmhzkxcv10002nwr6bcprlqpg",
    "rejectionReason": "Images do not meet quality standards. Please upload high-resolution photos showing the property exterior, rooms, and amenities. Descriptions should be more detailed.",
    "createdAt": "2025-11-15T04:47:22.687Z",
    "updatedAt": "2025-11-15T08:00:26.343Z",
    "owner": {
      "id": "cmhzt1o130000lbcyphi0suyx",
      "email": "lourdenbaydal15@gmail.com",
      "firstName": "LourdenB15",
      "lastName": "Baydal"
    },
    "roomTypes": [
      {
        "id": "cmhzt2b7j0003lbcyyhtwni1y",
        "propertyId": "cmhzt2b7j0002lbcy2pz3cycn",
        "name": "Standard Room",
        "description": "Comfortable room with queen bed",
        "bedConfiguration": "1 Queen Bed",
        "maxAdults": 2,
        "maxChildren": 1,
        "pricePerNight": 1200,
        "availableRooms": 8,
        "images": [],
        "amenities": [
          "WiFi",
          "TV",
          "Air Conditioning"
        ],
        "createdAt": "2025-11-15T04:47:22.687Z",
        "updatedAt": "2025-11-15T04:47:22.687Z"
      }
    ]
  }
}
```

**Notes:**
- Property status changes to `REJECTED`
- Property remains hidden from public search
- Owner receives rejection email with feedback
- Owner can edit and resubmit property
- Rejection reason is optional but recommended

---

### Get All Bookings

Get all bookings for admin monitoring.

**Endpoint**: `GET /api/admin/bookings`
**Authentication**: Required
**Role Required**: `ADMIN`

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/bookings" \
  -H "Authorization: Bearer <admin_clerk_token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": "cmhzvk38t000v10pwl8ibcl88",
      "bookingId": "GEM-5GW8Q2",
      "userId": "cmhzt1o130000lbcyphi0suyx",
      "propertyId": "cmhz2lqyy0004oldhpw1kf3y0",
      "roomTypeId": "cmhz2lqyz0005oldh8fxchap0",
      "checkInDate": "2027-02-18T00:00:00.000Z",
      "checkOutDate": "2027-02-19T00:00:00.000Z",
      "numberOfNights": 1,
      "adults": 2,
      "children": 1,
      "subtotal": 4500,
      "taxesAndFees": 540,
      "totalAmount": 5040,
      "bookingStatus": "CONFIRMED",
      "createdAt": "2025-11-15T05:57:11.406Z",
      "updatedAt": "2025-11-15T07:08:32.829Z",
      "user": {
        "id": "cmhzt1o130000lbcyphi0suyx",
        "email": "lourdenbaydal15@gmail.com",
        "firstName": "LourdenB15",
        "lastName": "Baydal",
        "clerkUserId": "user_35V4fvmJG7QUGiEtVbQrrZNakDW"
      },
      "property": {
        "id": "cmhz2lqyy0004oldhpw1kf3y0",
        "name": "Cebu Seaside Resort & Spa",
        "address": "Barangay Day-as, Buyong Road",
        "city": "Cordova, Cebu",
        "contactEmail": "reservations@cebuseaside.com"
      },
      "roomType": {
        "id": "cmhz2lqyz0005oldh8fxchap0",
        "name": "Deluxe Ocean View",
        "bedConfiguration": "1 King Bed",
        "pricePerNight": 4500
      },
      "payment": {
        "id": "cmhzxie0y0003g1svhrom4jxt",
        "xenditInvoiceId": "6918230626d6bc37164c1fa6",
        "amount": 5040,
        "paymentMethod": "CREDIT_CARD",
        "paymentStatus": "PAID",
        "transactionDate": "2025-11-15T07:08:32.742Z"
      }
    },
    {...},
    {...},
    {...}
  ]
}
```

---

## Webhooks

### Clerk Webhook

**Internal endpoint - called by Clerk only**

**Endpoint**: `POST /api/clerk/webhook`
**Authentication**: Clerk Svix signature verification
**Role Required**: None

**Purpose**: Sync Clerk user events to local database

**Supported Events:**
- `user.created` - Create user in local database
- `user.updated` - Update user information
- `user.deleted` - Mark user as deleted

**Success Response (200):**
```json
{
  "received": true
}
```

**Notes:**
- This endpoint is publicly accessible
- Clerk webhook signature is verified for security
- Webhook URL must be configured in Clerk dashboard
- Format: `https://your-api.com/api/clerk/webhook`

---

## Error Handling

### Centralized Error Handling

All errors in the SkyBridge Travels API go through a centralized error handler, ensuring **consistent error response structure** across all endpoints.

### Standard Error Response Format

**Production Mode:**
```json
{
  "success": false,
  "error": "Clear, user-friendly error message",
  "statusCode": 400,
  "timestamp": "2025-11-16T12:34:56.789Z"
}
```

**Development Mode (includes debugging fields):**
```json
{
  "success": false,
  "error": "Clear, user-friendly error message",
  "statusCode": 400,
  "timestamp": "2025-11-16T12:34:56.789Z",
  "errorType": "ValidationError",
  "path": "/api/bookings",
  "method": "POST",
  "stack": [
    "at Controller.createBooking (/server/src/controllers/booking.controller.js:25:11)",
    "..."
  ]
}
```

**Required Fields (All Environments):**
- `success` (boolean, always `false` for errors)
- `error` (string, human-readable error message)
- `statusCode` (number, HTTP status code)
- `timestamp` (string, ISO 8601 format)

**Development-Only Fields:**
- `errorType` (string, error class name for debugging)
- `path` (string, API endpoint that failed)
- `method` (string, HTTP method used)
- `stack` (array, stack trace for debugging)

**Optional Fields:**
- `details` (array, field-level validation errors)
- `data` (object, additional context if applicable)

### Validation Error Format

Validation errors include field-specific details:

```json
{
  "success": false,
  "error": "Validation failed",
  "statusCode": 400,
  "timestamp": "2025-11-16T12:34:56.789Z",
  "details": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    },
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

### Special Case: Webhook Errors

Webhook endpoints return 200 OK even on errors to prevent retries:

```json
{
  "success": false,
  "received": true,
  "error": "Error processing webhook event"
}
```
Note: Always returns HTTP 200 to acknowledge receipt

### HTTP Status Codes

| Status Code | Meaning | Usage |
|-------------|---------|-------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation error, invalid data |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 500 | Internal Server Error | Server-side error |

### Common Error Scenarios

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Property is not available for booking",
  "statusCode": 400,
  "timestamp": "2025-11-16T12:34:56.789Z"
}
```

**400 Validation Error:**
```json
{
  "success": false,
  "error": "Bookings can only be cancelled at least 7 days before check-in date",
  "statusCode": 400,
  "timestamp": "2025-11-16T12:34:56.789Z"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Authentication required. Please provide a valid token.",
  "statusCode": 401,
  "timestamp": "2025-11-16T12:34:56.789Z"
}
```

**403 Forbidden (Insufficient Permissions):**
```json
{
  "success": false,
  "error": "Access denied. Required role(s): ADMIN. Your role: CUSTOMER",
  "statusCode": 403,
  "timestamp": "2025-11-16T12:34:56.789Z"
}
```

**403 Forbidden (Resource Access):**
```json
{
  "success": false,
  "error": "You do not have permission to cancel this booking",
  "statusCode": 403,
  "timestamp": "2025-11-16T12:34:56.789Z"
}
```

**404 Not Found (Resource):**
```json
{
  "success": false,
  "error": "Property not found",
  "statusCode": 404,
  "timestamp": "2025-11-16T12:34:56.789Z"
}
```

**404 Not Found (User Not Synced):**
```json
{
  "success": false,
  "error": "Your account was not found in our system. Please sign out and sign in again to sync your account.",
  "statusCode": 404,
  "timestamp": "2025-11-16T12:34:56.789Z"
}
```

**404 Not Found (Route):**
```json
{
  "success": false,
  "error": "Route not found",
  "statusCode": 404,
  "path": "/api/invalid-endpoint",
  "method": "GET",
  "timestamp": "2025-11-16T12:34:56.789Z"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error",
  "statusCode": 500,
  "timestamp": "2025-11-16T12:34:56.789Z"
}
```

### Security Note

**Production mode** (`NODE_ENV=production`) **never** includes:
- Stack traces
- Error types
- Internal paths
- Method names

These fields are **only** included in **development mode** for debugging purposes.

---

## Response Formats

### Success Response Pattern

All successful responses include `success: true`:

**Single Resource:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Collection:**
```json
{
  "success": true,
  "count": 5,
  "data": [ ... ]
}
```

**Action Confirmation:**
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": { ... }
}
```

### Date/Time Format

All dates are in ISO 8601 format (UTC):

```
2025-01-15T10:30:00.000Z
```

For date-only inputs (check-in/out), use:

```
2025-01-15
```

### Nested Resource Inclusion

Endpoints often include related resources:

```json
{
  "property": {
    "roomTypes": [...],
    "owner": {...}
  }
}
```

---

## Testing the API

### Using cURL

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Search Properties:**
```bash
curl "http://localhost:5000/api/properties/search?propertyType=HOTEL"
```

**Create Booking (with auth):**
```bash
curl -X POST "http://localhost:5000/api/bookings" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "cmhz2lsj8000soldhxgj5dvbj",
    "roomTypeId": "cmhz2lsj8000toldhp22ne2p2",
    "checkInDate": "2025-12-15",
    "checkOutDate": "2025-12-17",
    "adults": 2,
    "children": 1
  }'
```

### Using Postman/Insomnia

1. Set base URL: `http://localhost:5000/api`
2. Add Authorization header: `Bearer <clerk_token>`
3. Import example requests from this documentation
4. Set Content-Type: `application/json` for POST/PUT/PATCH

### Frontend Integration

**Axios Configuration:**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// Add Clerk token to all requests
api.interceptors.request.use(async (config) => {
  const token = await window.Clerk.session.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**Usage:**
```javascript
import api from './lib/api';

// Search properties
const { data } = await api.get('/properties/search?propertyType=HOTEL');

// Create booking
const booking = await api.post('/bookings', {
  propertyId: 'clq123...',
  roomTypeId: 'clr456...',
  checkInDate: '2025-02-15',
  checkOutDate: '2025-02-17',
  adults: 2
});
```

---

## Rate Limits

**Current Implementation:** No rate limiting (MVP)

**Future Implementation:**
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

---

## Changelog

### Version 1.0.0 (2025-01-15)
- Initial API release
- Properties CRUD
- Booking system
- Payment integration (Xendit)
- Email notifications
- Admin approval workflow

---

**End of API Documentation**
