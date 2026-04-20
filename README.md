# 🚀 GitHub README Generator Pro

A professional, production-ready SaaS application for generating high-quality GitHub README.md files using a form-based UI.

## 📁 Project Structure

```
readme-generator/
├── client/                          # React Frontend
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.tsx   # Auth guard component
│   │   │   └── layout/
│   │   │       ├── Navbar.tsx            # Navigation bar
│   │   │       └── Footer.tsx            # Footer component
│   │   ├── lib/
│   │   │   └── api.ts                   # Axios API client
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx          # Conversion-optimized landing
│   │   │   ├── PricingPage.tsx          # Plan comparison + Stripe
│   │   │   ├── LoginPage.tsx            # Email/Google login
│   │   │   ├── RegisterPage.tsx         # Registration page
│   │   │   ├── DashboardPage.tsx        # User dashboard
│   │   │   └── GeneratorPage.tsx        # README form + live preview
│   │   ├── stores/
│   │   │   ├── authStore.ts             # Zustand auth state
│   │   │   └── readmeStore.ts           # Zustand README form state
│   │   ├── types/
│   │   │   └── index.ts                 # TypeScript type definitions
│   │   ├── App.tsx                      # Root component + routing
│   │   ├── main.tsx                     # Entry point
│   │   ├── index.css                    # Tailwind + custom styles
│   │   └── vite-env.d.ts               # Vite type declarations
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.ts                 # Environment config
│   │   │   ├── database.ts              # MongoDB connection
│   │   │   └── passport.ts              # Google OAuth config
│   │   ├── controllers/
│   │   │   ├── authController.ts        # Auth handlers
│   │   │   ├── readmeController.ts      # README CRUD handlers
│   │   │   └── paymentController.ts     # Stripe payment handlers
│   │   ├── middleware/
│   │   │   ├── auth.ts                  # JWT auth middleware
│   │   │   ├── errorHandler.ts          # Global error handler
│   │   │   └── validate.ts              # Zod validation middleware
│   │   ├── models/
│   │   │   ├── User.ts                  # User model + methods
│   │   │   ├── Readme.ts               # Saved README model
│   │   │   └── index.ts                # Model exports
│   │   ├── routes/
│   │   │   ├── authRoutes.ts            # Auth endpoints
│   │   │   ├── readmeRoutes.ts          # README endpoints
│   │   │   └── paymentRoutes.ts         # Payment endpoints
│   │   ├── services/
│   │   │   ├── stripeService.ts         # Stripe integration
│   │   │   ├── badgeGenerator.ts        # Shields.io badge generator
│   │   │   └── templates/
│   │   │       ├── index.ts             # Template registry
│   │   │       ├── modern.ts            # Modern template (free)
│   │   │       ├── minimal.ts           # Minimal template (free)
│   │   │       └── advanced.ts          # Advanced template (pro)
│   │   ├── utils/
│   │   │   ├── AppError.ts             # Custom error class
│   │   │   ├── jwt.ts                  # JWT utilities
│   │   │   └── validation.ts           # Zod schemas
│   │   ├── app.ts                      # Express app setup
│   │   └── server.ts                   # Server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── package.json                     # Root workspace scripts
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| State Management | Zustand |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB with Mongoose ODM |
| Authentication | JWT + Google OAuth 2.0 (Passport.js) |
| Payments | Stripe (Subscriptions + Customer Portal) |
| Validation | Zod |
| Markdown | react-markdown + remark-gfm |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- Stripe account (for payments)
- Google OAuth credentials (optional)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd readme-generator

# Install all dependencies
npm run install:all

# Or install individually
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment

```bash
# Edit .env.development for local development
# Edit .env.production for production deployment values
```

Environment handling now supports mode-based files at the repository root:

- `.env.development` for local development
- `.env.production` for production deployments

The server loads `.env.<NODE_ENV>` automatically (with fallback to `.env`), and the client (Vite) reads environment files from the repository root by mode.

**Required environment variables:**

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing (use a strong random string) |
| `STRIPE_SECRET_KEY` | Stripe secret key (starts with `sk_`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint secret (starts with `whsec_`) |
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for the Pro plan |
| `CLIENT_URL` | Frontend URL (default: `http://localhost:5173`) |

**Optional:**

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL |

### 3. Setup Stripe

1. Create a [Stripe account](https://stripe.com)
2. Create a Product called "README Generator Pro"
3. Add a Price of $4/month (recurring)
4. Copy the Price ID to `STRIPE_PRO_PRICE_ID`
5. Set up a webhook endpoint pointing to `https://your-domain.com/api/payments/webhook`
6. Select these webhook events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`

### 4. Run Development

```bash
# From root directory - starts both server and client
npm run dev

# Or run separately:
npm run dev:server   # Backend on http://localhost:5000
npm run dev:client   # Frontend on http://localhost:5173
```

---

## 📊 Database Schema

### User Collection

```javascript
{
  name: String,           // Display name
  email: String,          // Unique, lowercase
  password: String,       // Hashed with bcrypt (select: false)
  googleId: String,       // Google OAuth ID
  avatar: String,         // Profile picture URL
  isEmailVerified: Boolean,
  plan: 'free' | 'pro',
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  subscriptionStatus: 'none' | 'active' | 'canceled' | 'past_due',
  subscriptionEndDate: Date,
  exportsUsedThisMonth: Number,    // Tracks free plan usage
  exportsResetDate: Date,          // First of next month
  timestamps: true                 // createdAt, updatedAt
}
```

### Readme Collection

```javascript
{
  userId: ObjectId,        // Reference to User
  title: String,           // Project name
  input: {                 // All form inputs stored
    projectName, description, techStack[], features[],
    installation[], usage, apiDocs, screenshots[],
    githubRepo, liveDemo, license, authorName,
    authorGithub, authorEmail, authorWebsite,
    customSections[{ title, content }]
  },
  generatedMarkdown: String,   // Full generated output
  templateId: String,          // Which template was used
  themeVariant: String,        // Theme variant applied
  isPublic: Boolean,
  timestamps: true
}
```

---

## 🔐 Authentication Flow

### Email/Password

1. User registers with name, email, password
2. Password is hashed with bcrypt (12 rounds)
3. JWT token generated and sent as HTTP-only cookie + response body
4. Token attached to subsequent requests via `Authorization: Bearer <token>` header

### Google OAuth

1. User clicks "Continue with Google"
2. Redirected to Google consent screen
3. On approval, callback creates/links user account
4. JWT token generated, user redirected to dashboard with token in URL
5. Frontend stores token in localStorage

### Session Management

- JWT tokens expire in 7 days (configurable)
- HTTP-only cookies for security (prevents XSS)
- Token extracted from cookie OR Authorization header
- Rate limiting on auth endpoints (20 requests/15 min)

---

## 💳 Monetization Architecture

### Plans

| Feature | Free | Pro ($4/mo) |
|---------|------|-------------|
| Modern Template | ✅ | ✅ |
| Minimal Template | ✅ | ✅ |
| Advanced Pro Template | ❌ | ✅ |
| Exports per Month | 5 | Unlimited |
| Shields.io Badges | ✅ | ✅ |
| Live Preview | ✅ | ✅ |
| Custom Sections | ❌ | ✅ |
| Priority Support | ❌ | ✅ |

### Stripe Integration Flow

```
User clicks "Upgrade" 
  → Backend creates Stripe Checkout Session
  → User redirected to Stripe hosted checkout
  → On payment success:
      → Stripe sends webhook to /api/payments/webhook
      → Server updates user.plan to 'pro'
      → User redirected to dashboard with success state
```

### Webhook Events Handled

- `checkout.session.completed` — Initial subscription activation
- `invoice.payment_succeeded` — Recurring payment success
- `invoice.payment_failed` — Payment failure (marks as past_due)
- `customer.subscription.deleted` — Cancellation
- `customer.subscription.updated` — Plan changes

---

## 🚢 Deployment Guide

### Frontend → Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Set the **Root Directory** to `client`
4. Set the **Build Command** to `npm run build`
5. Set the **Output Directory** to `dist`
6. Add environment variable:
   ```
   VITE_API_URL=https://your-api.onrender.com/api
   ```
7. Deploy!

### Backend → Render

1. Go to [render.com](https://render.com) and create a new **Web Service**
2. Connect your GitHub repository
3. Set the **Root Directory** to `server`
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `node dist/server.js`
6. Add environment variables from `.env.example`
7. Set `CLIENT_URL` to your Vercel frontend URL
8. Deploy!

### MongoDB → MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user
3. Whitelist IP addresses (or use 0.0.0.0/0 for Render)
4. Get the connection string and set as `MONGODB_URI`

### Stripe Webhook Setup (Production)

1. In Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://your-api.onrender.com/api/payments/webhook`
3. Select the events listed above
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

---

## 🔒 Security Best Practices

| Practice | Implementation |
|----------|---------------|
| Password Hashing | bcrypt with 12 salt rounds |
| JWT Security | HTTP-only cookies, configurable expiry |
| Input Validation | Zod schemas on all endpoints |
| CORS | Restricted to client origin only |
| Rate Limiting | 100 req/15min general, 20 req/15min auth |
| Helmet | Security headers (XSS, CSP, etc.) |
| Error Handling | No sensitive data leaked in production errors |
| SQL/NoSQL Injection | Mongoose parameterized queries |
| Webhook Verification | Stripe signature validation |
| Environment Variables | Secrets never committed to git |

---

## 🔮 Future Scaling Suggestions

### Short Term
- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] More template themes (Dark, Colorful, Corporate)
- [ ] README version history
- [ ] Public README gallery/sharing

### Medium Term
- [ ] AI-powered README suggestions (OpenAI integration)
- [ ] GitHub App integration (auto-push README to repo)
- [ ] Team/organization accounts
- [ ] Custom CSS themes for Pro users
- [ ] README analytics (views, copies)

### Long Term
- [ ] Multi-language README generation
- [ ] GitHub Actions integration
- [ ] API access for CI/CD pipelines
- [ ] White-label solution for enterprises
- [ ] Plugin marketplace for custom sections

### Infrastructure Scaling
- Add Redis for session caching and rate limiting
- Implement CDN for static assets
- Add horizontal scaling with PM2 cluster mode
- Database read replicas for high traffic
- Implement message queues for async processing
- Add monitoring (Sentry, DataDog)

---

## 📄 API Reference

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | No | Clear session |
| GET | `/api/auth/me` | Yes | Get profile |
| PATCH | `/api/auth/me` | Yes | Update profile |
| GET | `/api/auth/google` | No | Start Google OAuth |
| GET | `/api/auth/google/callback` | No | OAuth callback |

### README Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/readmes/preview` | Optional | Preview markdown |
| POST | `/api/readmes/generate` | Yes | Generate & save |
| GET | `/api/readmes` | Yes | List saved READMEs |
| GET | `/api/readmes/:id` | Yes | Get single README |
| PATCH | `/api/readmes/:id` | Yes | Update README |
| DELETE | `/api/readmes/:id` | Yes | Delete README |
| GET | `/api/readmes/templates` | Optional | List templates |

### Payment Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/create-checkout` | Yes | Start Stripe checkout |
| POST | `/api/payments/create-portal` | Yes | Open billing portal |
| GET | `/api/payments/status` | Yes | Get subscription status |
| POST | `/api/payments/webhook` | No | Stripe webhook handler |

---

## 📜 License

MIT License — feel free to use this as a foundation for your own SaaS products.
