# URGE360 - API Documentation

## Base URL
```
Production: https://api.urge360.es/v1
Staging: https://api-staging.urge360.es/v1
Development: http://localhost:4000/v1
```

## Autenticación

### Bearer Token (JWT)
```http
Authorization: Bearer <token>
```

### Obtener Token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "client"
  }
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Endpoints

### Auth

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "María García",
  "phone": "+34 612 345 678",
  "role": "client"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "password": "newPassword123"
}
```

### Users

#### Get Current User
```http
GET /users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "María García",
  "phone": "+34 612 345 678",
  "role": "client",
  "verified": true,
  "address": {
    "id": "uuid",
    "street": "Calle Gran Vía 28, 3ºB",
    "city": "Madrid",
    "postalCode": "28013",
    "lat": 40.4200,
    "lng": -3.7025
  }
}
```

#### Update User
```http
PATCH /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "María García López",
  "phone": "+34 612 345 679"
}
```

### Orders

#### List Orders
```http
GET /orders?status=active&type=repair&page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "repair",
      "status": "en_route",
      "createdAt": "2024-01-15T10:30:00Z",
      "price": {
        "total": 73.50,
        "currency": "EUR"
      },
      "eta": 8
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

#### Get Order
```http
GET /orders/:id
Authorization: Bearer <token>
```

#### Create Repair Order
```http
POST /orders/repair
Authorization: Bearer <token>
Idempotency-Key: unique-key-123
Content-Type: application/json

{
  "category": "plumbing",
  "description": "Fuga en tubería del baño",
  "urgency": "urgent",
  "photos": ["url1", "url2"],
  "addressId": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "type": "repair",
  "status": "triaged",
  "triage": {
    "category": "plumbing",
    "urgency": "urgent",
    "risk": "medium",
    "estimatedDuration": 60,
    "confidence": 0.92
  },
  "price": {
    "base": 25.00,
    "time": 30.00,
    "urgency": 15.00,
    "total": 70.00,
    "currency": "EUR"
  },
  "eta": 15
}
```

#### Create Courier Order
```http
POST /orders/courier
Authorization: Bearer <token>
Idempotency-Key: unique-key-456
Content-Type: application/json

{
  "pickupAddress": {
    "street": "Calle Serrano 45",
    "city": "Madrid",
    "postalCode": "28001"
  },
  "deliveryAddress": {
    "street": "Calle Atocha 12",
    "city": "Madrid",
    "postalCode": "28012"
  },
  "packageType": "medium",
  "packageDescription": "Caja de documentos",
  "priority": "express",
  "otpRequired": true,
  "photoProof": true,
  "signatureProof": true
}
```

#### Update Order Status
```http
PATCH /orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "en_route",
  "note": "En camino, ETA 8 min"
}
```

**Valid Transitions:**
- Repair: created → triaged → quoted → confirmed → assigned → en_route → arrived → in_progress → completed → paid → rated
- Courier: created → quoted → confirmed → assigned → en_route → arrived → picked_up → delivered → paid → rated

#### Cancel Order
```http
POST /orders/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Ya no necesito el servicio"
}
```

### Dispatch

#### Auto Dispatch
```http
POST /orders/:id/dispatch
Authorization: Bearer <token>
```

**Response:**
```json
{
  "professionalId": "uuid",
  "professionalName": "Carlos Fontanero",
  "score": {
    "eta": 8,
    "skillMatch": 1.0,
    "availability": 1.0,
    "total": 0.94
  }
}
```

#### Manual Dispatch
```http
POST /orders/:id/dispatch
Authorization: Bearer <token>
Content-Type: application/json

{
  "professionalId": "uuid"
}
```

### Evidences

#### Add Evidence
```http
POST /orders/:id/evidence
Authorization: Bearer <token>
Content-Type: multipart/form-data

type: photo
file: <binary>
```

**Response:**
```json
{
  "id": "uuid",
  "type": "photo",
  "url": "https://storage.urge360.es/evidences/uuid.jpg",
  "createdAt": "2024-01-15T11:00:00Z"
}
```

#### Verify OTP
```http
POST /orders/:id/verify-otp
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "847291"
}
```

**Response:**
```json
{
  "verified": true,
  "evidenceId": "uuid"
}
```

### Ratings

#### Rate Order
```http
POST /orders/:id/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 5,
  "comment": "Excelente servicio, muy profesional"
}
```

### Payments

#### Create Payment
```http
POST /orders/:id/pay
Authorization: Bearer <token>
Idempotency-Key: payment-key-789
Content-Type: application/json

{
  "method": "card",
  "cardToken": "tok_visa"
}
```

**Response:**
```json
{
  "paymentId": "uuid",
  "status": "processed",
  "amount": 73.50,
  "currency": "EUR"
}
```

#### Get Payment Status
```http
GET /payments/:id
Authorization: Bearer <token>
```

### Invoices

#### Get Invoice
```http
GET /invoices/:orderId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "invoiceNumber": "URGE360-ABC123",
  "orderId": "uuid",
  "amount": 73.50,
  "iva": 12.89,
  "total": 73.50,
  "issuedAt": "2024-01-15T12:00:00Z",
  "pdfUrl": "https://storage.urge360.es/invoices/uuid.pdf"
}
```

#### Download Invoice PDF
```http
GET /invoices/:id/pdf
Authorization: Bearer <token>
```

### Claims

#### Create Claim
```http
POST /claims
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "uuid",
  "type": "quality",
  "description": "El trabajo no quedó bien terminado"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "pending",
  "createdAt": "2024-01-15T13:00:00Z"
}
```

#### List Claims
```http
GET /claims?orderId=uuid
Authorization: Bearer <token>
```

### Chat

#### Send Message
```http
POST /orders/:id/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "¿Cuánto tardarás en llegar?"
}
```

#### Get Messages
```http
GET /orders/:id/chat?limit=50
Authorization: Bearer <token>
```

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "senderId": "uuid",
      "senderName": "María García",
      "message": "¿Cuánto tardarás en llegar?",
      "createdAt": "2024-01-15T11:30:00Z"
    }
  ]
}
```

### Professionals

#### Get Available Professionals
```http
GET /professionals?trade=plumbing&lat=40.4200&lng=-3.7025&radius=5
Authorization: Bearer <token>
```

**Response:**
```json
{
  "professionals": [
    {
      "id": "uuid",
      "name": "Carlos Fontanero",
      "rating": 4.8,
      "completedJobs": 342,
      "distance": 1.2,
      "eta": 8
    }
  ]
}
```

#### Update Availability
```http
PATCH /professionals/me/availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "available": true,
  "location": {
    "lat": 40.4180,
    "lng": -3.7035
  }
}
```

### Admin

#### List Users (Admin/Ops)
```http
GET /admin/users?role=professional&page=1
Authorization: Bearer <token>
```

#### Update User Role (Admin)
```http
PATCH /admin/users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "professional"
}
```

#### Get Metrics (Admin/Ops)
```http
GET /admin/metrics?period=7d
Authorization: Bearer <token>
```

**Response:**
```json
{
  "gmv": 15420.50,
  "orders": 234,
  "activeProfessionals": 45,
  "avgEta": 18,
  "fillRate": 0.94,
  "nps": 72
}
```

## Error Codes

### Standard HTTP Codes
- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `409` Conflict
- `422` Unprocessable Entity
- `429` Too Many Requests
- `500` Internal Server Error

### Custom Error Codes
```json
{
  "error": {
    "code": "ORDER_ALREADY_ASSIGNED",
    "message": "Order is already assigned to a professional",
    "details": {}
  }
}
```

**Common Codes:**
- `ORDER_ALREADY_ASSIGNED`
- `INVALID_STATE_TRANSITION`
- `PROFESSIONAL_NOT_AVAILABLE`
- `INSUFFICIENT_PERMISSIONS`
- `PAYMENT_FAILED`
- `OTP_EXPIRED`
- `OTP_ALREADY_USED`
- `RATE_LIMIT_EXCEEDED`

## Rate Limiting

- **Auth endpoints**: 5 requests / 15 minutes
- **Standard endpoints**: 100 requests / minute
- **Admin endpoints**: 200 requests / minute

**Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642249200
```

## Webhooks

### Subscribe to Webhooks
```http
POST /webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["order.completed", "payment.processed"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload
```json
{
  "event": "order.completed",
  "timestamp": "2024-01-15T12:00:00Z",
  "data": {
    "orderId": "uuid",
    "status": "completed",
    "price": {
      "total": 73.50
    }
  },
  "signature": "sha256=..."
}
```

## SDKs

### JavaScript/TypeScript
```bash
npm install @urge360/sdk
```

```typescript
import { URGE360 } from '@urge360/sdk';

const client = new URGE360({
  apiKey: 'your-api-key',
  environment: 'production'
});

const order = await client.orders.createRepair({
  category: 'plumbing',
  description: 'Fuga en tubería',
  urgency: 'urgent'
});
```

### Python
```bash
pip install urge360
```

```python
from urge360 import URGE360

client = URGE360(api_key='your-api-key')

order = client.orders.create_repair(
    category='plumbing',
    description='Fuga en tubería',
    urgency='urgent'
)
```

## Changelog

### v1.2.0 (2024-01-15)
- Added chat functionality
- Added signature capture
- Added invoice generation

### v1.1.0 (2024-01-01)
- Added courier service
- Added OTP verification
- Added photo evidence

### v1.0.0 (2023-12-01)
- Initial release
- Repair service
- Basic dispatch
