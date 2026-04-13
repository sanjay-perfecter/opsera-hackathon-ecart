# Quick Start Guide

## Prerequisites
- Node.js v16+ installed
- MongoDB installed and running
- Stripe account (for payments)

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your actual values:
- MongoDB connection string
- JWT secrets (generate secure random strings)
- Stripe API keys (from your Stripe dashboard)
- Encryption key (32 characters)

### 2. Install Dependencies

```bash
# Install all dependencies for all services
npm run install-all
```

### 3. Seed Database

```bash
# Seed sample products
npm run seed
```

### 4. Start Services

Open 7 terminal windows and run each command:

**Terminal 1 - API Gateway:**
```bash
npm run dev:gateway
```

**Terminal 2 - Auth Service:**
```bash
npm run dev:auth
```

**Terminal 3 - User Service:**
```bash
npm run dev:user
```

**Terminal 4 - Product Service:**
```bash
npm run dev:product
```

**Terminal 5 - Cart/Order Service:**
```bash
npm run dev:cart-order
```

**Terminal 6 - Payment Service:**
```bash
npm run dev:payment
```

**Terminal 7 - Frontend:**
```bash
npm run dev:frontend
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:5000

## Using Docker (Alternative)

```bash
# Start all services with Docker
docker-compose up

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build
```

## Creating an Admin Account

1. Sign up for a new account through the UI
2. Connect to MongoDB and update the user role:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Testing Payments

Use Stripe test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- Use any future expiry date and any 3-digit CVC

## Stripe Webhook Setup (for local development)

Install Stripe CLI:
```bash
stripe listen --forward-to localhost:5005/api/payments/webhook
```

This will give you a webhook secret - update it in your `.env` file.

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check the connection string in `.env`

### Port Already in Use
- Change the port numbers in `.env`
- Or kill the processes using the ports

### Module Not Found Errors
- Run `npm run install-all` again
- Check that all package.json files are present

## Project Structure

```
metayb/
├── frontend/              # React application
├── backend/
│   ├── gateway/          # API Gateway (Port 5000)
│   ├── services/
│   │   ├── auth/         # Auth Service (Port 5001)
│   │   ├── user/         # User Service (Port 5002)
│   │   ├── product/      # Product Service (Port 5003)
│   │   ├── cart-order/   # Cart/Order Service (Port 5004)
│   │   └── payment/      # Payment Service (Port 5005)
│   └── shared/           # Shared utilities
└── docker-compose.yml    # Docker configuration
```

## Key Features

### User Features
- ✅ User authentication with JWT & refresh tokens
- ✅ Browse products by category
- ✅ Add products to cart
- ✅ Stripe payment integration
- ✅ Order history
- ✅ Profile management

### Admin Features
- ✅ Dashboard with statistics
- ✅ User management (CRUD, role management)
- ✅ Product management (CRUD, image upload, stock)
- ✅ Order management (view all, update status)

### Security Features
- ✅ JWT authentication with refresh tokens
- ✅ Encrypted token storage in localStorage
- ✅ RBAC (Role-Based Access Control)
- ✅ Password hashing with bcrypt
- ✅ Helmet for HTTP headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation

## API Documentation

See [README.md](README.md) for complete API endpoint documentation.

## Support

For issues or questions, please refer to the main README.md file.
