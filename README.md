# Sabir Shah Traders - E-Commerce Platform

A production-ready e-commerce website and admin panel built with Next.js, featuring secure authentication, comprehensive payment integration, and real-time order management.

## Features

### Customer-Facing

- Modern responsive design with smooth animations
- Product catalog with categories
- Shopping cart with localStorage persistence
- Secure checkout with multiple payment options
- Order tracking
- Wishlist functionality

### Admin Panel

- Secure JWT-based authentication with role-based access
- Real-time dashboard with sales analytics
- Order management with status updates
- Payment tracking (COD, EasyPaisa, JazzCash, Card)
- Customer management
- Inventory tracking

### Security

- HTTP-only secure cookies
- Rate limiting on all sensitive endpoints
- XSS protection with input sanitization
- CSRF protection headers
- Role-based access control (Super Admin, Admin, Staff)
- Activity logging

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with refresh tokens
- **Styling**: Tailwind CSS
- **UI Components**: Lucide Icons, Framer Motion
- **Payment**: COD + EasyPaisa/JazzCash ready + Stripe integration ready

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

# Admin Credentials (change these for production)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# Payment Account Numbers (for EasyPaisa/JazzCash instructions)
EASYPAISA_ACCOUNT=03XX-XXXXXXX
JAZZCASH_ACCOUNT=03XX-XXXXXXX

# Optional: For future Stripe integration
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (local or Atlas)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sabir-shah-ecom-nextjs

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront.
Open [http://localhost:3000/admin-login](http://localhost:3000/admin-login) for the admin panel.

## Production Deployment

### 1. Environment Setup

```bash
# Set NODE_ENV to production
NODE_ENV=production

# Ensure all environment variables are set
# Never commit .env.local to git
```

### 2. Build

```bash
npm run build
```

### 3. Deploy Options

#### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

#### Self-Hosted (Node.js)

```bash
npm start
# Server will run on port 3000
```

#### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 4. Post-Deployment Checklist

- [ ] Change default admin credentials
- [ ] Set strong JWT secrets (min 32 characters)
- [ ] Configure MongoDB with proper access controls
- [ ] Set up SSL/HTTPS
- [ ] Configure payment account numbers
- [ ] Test all payment flows
- [ ] Verify rate limiting is active
- [ ] Check security headers in responses
- [ ] Set up error monitoring (Sentry recommended)

## Security Considerations

### Authentication Flow

1. Admin logs in with username/password
2. Server validates credentials and issues:
   - Access token (2-hour expiry, HTTP-only cookie)
   - Refresh token (7-day expiry, HTTP-only cookie)
3. Middleware validates tokens on each request
4. Auto-refresh mechanism handles expired access tokens

### Rate Limits

- Login: 5 attempts per 15 minutes per IP
- Order creation: 10 per hour per IP
- API updates: 30 per minute per IP
- Stats: 60 per minute per IP

### XSS Protection

- All inputs sanitized using DOMPurify approach
- Security headers applied to all responses
- Content Security Policy configured

## API Endpoints

### Public

- `GET /api/products` - List products
- `GET /api/products/[id]` - Get product
- `POST /api/orders` - Create order

### Admin (Protected)

- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/check-auth` - Verify session
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/orders` - List all orders
- `GET /api/orders/[id]` - Get order details
- `PATCH /api/orders/[id]` - Update order status
- `PATCH /api/orders/[id]/payment` - Update payment status
- `DELETE /api/orders/[id]` - Delete order (super admin only)

## Payment Methods

### Cash on Delivery (COD)

- Default payment method
- No additional configuration needed

### EasyPaisa

- Manual verification required
- Set `EASYPAISA_ACCOUNT` in env
- Customers see instructions at checkout

### JazzCash

- Manual verification required
- Set `JAZZCASH_ACCOUNT` in env
- Customers see instructions at checkout

### Credit/Debit Card

- Ready for Stripe integration
- Set `STRIPE_*` environment variables
- Uncomment card payment in checkout

## Order Status Flow

```
pending → confirmed → processing → shipped → delivered
   ↓
cancelled/refunded
```

### Payment Status Flow

```
pending → authorized → paid → refunded
   ↓
failed/cancelled
```

## Troubleshooting

### Login Issues

- Check JWT_SECRET is set and consistent
- Verify ADMIN_USERNAME and ADMIN_PASSWORD
- Check browser cookies are enabled

### Database Connection

- Verify MONGODB_URI format
- Check IP whitelist for MongoDB Atlas
- Ensure database user has proper permissions

### Order Creation Fails

- Check rate limiting hasn't been triggered
- Verify all required fields are provided
- Review server logs for validation errors

## Support

For production deployment assistance, contact the development team.

## License

Proprietary - Sabir Shah Traders
