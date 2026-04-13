# MERN Stack E-Commerce Application — Vegetable & Fruit Shop

A full-stack e-commerce application built with microservices architecture for selling vegetables and fruits.

---

## 🏆 Opsera × Kissflow CTO Talks AI Hackathon — Chennai 2026

This repository is my submission for the **Opsera AI Agents Hackathon** (April 13–14, 2026). I used Opsera's DevSecOps AI agents to audit and harden a production-style MERN microservices e-commerce app, then shipped concrete security fixes driven by the agent findings.

### Opsera agents used
| Agent | What it did | Report |
|---|---|---|
| **Architecture agent** | Mapped the 6-service topology, surfaced resilience risks (no replicas, no circuit breakers, rate limiting only at the gateway) | [Opsera_reports/Architecture/Opsera_architeture_result.md](Opsera_reports/Architecture/Opsera_architeture_result.md) + [diagram](Opsera_reports/screenshots/Opsera_architecture.png) |
| **Security agent** | Ran Gitleaks, Semgrep (SAST), Grype (SCA), Checkov (IaC), Hadolint (Dockerfile linting) | [Opsera_reports/Security/Summary.md](Opsera_reports/Security/Summary.md) · raw: [semgrep.json](Opsera_reports/Security/semgrep.json) · [grype.txt](Opsera_reports/Security/grype.txt) |
| **Compliance agent** | CIS Docker · OWASP ASVS L1 · PCI-DSS SAQ-A · GDPR data-handling subset | [Opsera_reports/Compliance/Summary.md](Opsera_reports/Compliance/compliance-audit-soc2-2026-04-14) |


### Headline findings & fixes (before → after)
| Finding | Source | Before | After |
|---|---|---|---|
| Container runs as root (`CKV_DOCKER_3` / Semgrep `missing-user`) | Checkov caught 1; Semgrep caught **7 more** | 8 Dockerfiles rootful | `USER node` / `USER 1000:1000` added to **all 8** |
| `FROM stripe/stripe-cli:latest` unpinned (`DL3007`) | Hadolint | `:latest` | Pinned to `v1.21.8` |
| Critical CVE in `axios 1.13.2` (GHSA-fvcv-3m26-pcqx, GHSA-3p68-rc4w-qgx5) | Grype | `^1.6.5` resolving to vulnerable 1.13.2 across 8 manifests | Bumped to `^1.15.0` everywhere |
| Path traversal via `fs.unlinkSync(path.join(..., product.imageUrl))` | Semgrep `path-traversal` | Unsafe join on DB field | [Containment check via `path.resolve` + `startsWith`](backend/services/product/controllers/productController.js#L191-L202) |

Full before/after delta, counts by severity, and accepted-risk items are documented in [Opsera_reports/Security/Summary.md](Opsera_reports/Security/Summary.md).

### How to reproduce the Opsera agent runs
```bash
# Security agent (SAST + SCA + IaC)
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 semgrep scan \
    --config=p/default --config=p/javascript --config=p/nodejs --config=p/owasp-top-ten \
    --exclude=node_modules --exclude=Opsera_reports \
    --json --output=Opsera_reports/Security/semgrep.json .

grype dir:. --exclude './node_modules/**' --exclude './Opsera_reports/**' -o table

gitleaks detect --no-git --redact
checkov -d . --framework dockerfile
hadolint Dockerfile
```
Agents were invoked via the Opsera IDE extension (`@opsera` in Cursor / VS Code / Claude Code). See [docs.agents.opsera.ai](https://docs.agents.opsera.ai/) for setup.

### Verifying the fixes
```bash
docker build -t ecart-stripe:hardened .                     # root Dockerfile — passes
docker build -t ecart-gateway:hardened backend/gateway       # each service likewise
PYTHONIOENCODING=utf-8 semgrep scan --config=p/javascript --config=p/nodejs \
    --exclude=node_modules --exclude=Opsera_reports .        # re-scan: missing-user + path-traversal cleared
```

---

## Features

### User Features

- User authentication (signup/signin) with JWT and refresh tokens
- Browse products by category
- Add products to cart
- Checkout with Stripe payment integration
- View order history
- User profile management

### Admin Features

- Dashboard with statistics
- Manage users (CRUD, role management)
- Manage products (CRUD, image upload, stock management)
- Manage orders (view all, update status)

## Tech Stack

- **Frontend**: React 18, React Router v6, Context API, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, Microservices Architecture
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with refresh tokens, encrypted token storage
- **Payments**: Stripe
- **Security**: Helmet, CORS, Rate Limiting, RBAC
- **File Upload**: Multer

## Architecture

The application follows a microservices architecture with the following services:

- **API Gateway** (Port 5000): Routes requests to appropriate microservices
- **Auth Service** (Port 5001): Handles authentication and authorization
- **User Service** (Port 5002): Manages user data and profiles
- **Product Service** (Port 5003): Manages product catalog
- **Cart/Order Service** (Port 5004): Handles shopping cart and orders
- **Payment Service** (Port 5005): Integrates with Stripe for payments

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn
- Stripe account (for payment testing)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd metayb
```

### 2. Install dependencies for all services

```bash
npm run install-all
```

Or manually install for each service:

```bash
# Root
npm install

# Frontend
cd frontend && npm install

# Gateway
cd backend/gateway && npm install

# Each microservice
cd backend/services/auth && npm install
cd backend/services/user && npm install
cd backend/services/product && npm install
cd backend/services/cart-order && npm install
cd backend/services/payment && npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
MONGODB_URI=mongodb://localhost:27017/metayb-ecommerce
JWT_SECRET=your_secure_jwt_secret
JWT_REFRESH_SECRET=your_secure_refresh_secret
ENCRYPTION_KEY=your_32_character_encryption_key_
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For MongoDB service
mongod
```

### 5. Seed the database with sample products

```bash
npm run seed
```

## Running the Application

### Development Mode

Open 7 terminal windows and run each service separately:

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

### Using Docker (Optional)

```bash
docker-compose up
```

## Access the Application

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:5000
- **Auth Service**: http://localhost:5001
- **User Service**: http://localhost:5002
- **Product Service**: http://localhost:5003
- **Cart/Order Service**: http://localhost:5004
- **Payment Service**: http://localhost:5005

## Default Admin Account

After seeding, you can create an admin account by signing up and then manually updating the role in MongoDB:

```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/verify` - Verify token

### Products

- `GET /api/products` - Get all products (with optional category filter)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Cart

- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:productId` - Remove from cart

### Orders

- `GET /api/orders` - Get user's orders
- `GET /api/orders/all` - Get all orders (admin only)
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (admin only)

### Payments

- `POST /api/payments/create-checkout-session` - Create Stripe checkout
- `POST /api/payments/webhook` - Stripe webhook handler

## Project Structure

```
metayb/
├── frontend/                    # React application
│   ├── public/
│   └── src/
│       ├── components/          # Reusable components
│       ├── pages/               # Page components
│       ├── context/             # React Context
│       ├── services/            # API services
│       ├── hooks/               # Custom hooks
│       └── utils/               # Utilities
├── backend/
│   ├── gateway/                 # API Gateway
│   ├── services/
│   │   ├── auth/                # Auth microservice
│   │   ├── user/                # User microservice
│   │   ├── product/             # Product microservice
│   │   ├── cart-order/          # Cart/Order microservice
│   │   └── payment/             # Payment microservice
│   └── shared/                  # Shared utilities
└── docker-compose.yml           # Docker configuration
```

## Testing Stripe Payments

Use Stripe test card numbers:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- Use any future expiry date and any 3-digit CVC

## Security Features

- JWT authentication with refresh tokens
- Encrypted token storage in localStorage
- RBAC (Role-Based Access Control)
- Password hashing with bcrypt
- Helmet for HTTP headers
- CORS configuration
- Rate limiting
- Input validation

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check the `MONGODB_URI` in `.env`

### Port Already in Use

- Change the port in `.env` file
- Or kill the process using the port

### Stripe Webhook Issues

- For local testing, use Stripe CLI to forward webhooks
- Run: `stripe listen --forward-to localhost:5005/api/payments/webhook`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC
