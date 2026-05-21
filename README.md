# Drinqink

A modern e-commerce platform for wine and spirits delivery, built with cutting-edge web technologies.

## Features

- **User Authentication**: Secure authentication via Supabase
- **Product Catalog**: Browse and search wines, spirits, and beverages
- **Shopping Cart**: Add to cart, manage quantities, and checkout
- **Payment Integration**: Secure payments via Paystack
- **Order Management**: Track orders, view order history
- **Vendor Dashboard**: For vendors to manage products and orders
- **Admin Panel**: Administrative controls for platform management
- **Corporate Accounts**: Special features for corporate clients
- **Loyalty Program**: Points and rewards system
- **Referral System**: Refer friends and earn rewards
- **Event Planning**: Plan events with alcohol delivery
- **Group Orders**: Coordinate group purchases
- **The Cellar**: Premium collection and exclusive offerings
- **Blog**: Content management and articles

## Tech Stack

- **Framework**: TanStack Start (React SSR framework)
- **UI**: React 19, Tailwind CSS 4, Radix UI components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Paystack
- **State Management**: Zustand, TanStack Query
- **Routing**: TanStack Router
- **Forms**: React Hook Form, Zod validation
- **Deployment**: Cloudflare Workers (via Wrangler)

## Prerequisites

- Node.js 18+ 
- Bun or npm
- Supabase account
- Paystack account

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Echogreat05/drinqink.git
cd drinqink
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Supabase Configuration
SUPABASE_PUBLISHABLE_KEY="your_supabase_publishable_key"
SUPABASE_URL="your_supabase_url"
VITE_SUPABASE_PROJECT_ID="your_supabase_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_publishable_key"
VITE_SUPABASE_URL="your_supabase_url"

# Paystack Configuration
VITE_PAYSTACK_PUBLIC_KEY="pk_test_your_paystack_public_key"
PAYSTACK_SECRET_KEY="sk_test_your_paystack_secret_key"
PAYSTACK_WEBHOOK_SECRET="whsec_your_webhook_secret"
VITE_PAYSTACK_API_BASE_URL="https://api.paystack.co"
```

4. Run database migrations:
```bash
supabase db push
```

## Development

Start the development server:
```bash
bun run dev
# or
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run build:dev` - Build for development
- `bun run preview` - Preview production build
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier

## Security Features

- **Security Headers**: OWASP recommended headers (CSP, HSTS, X-Frame-Options, etc.)
- **Rate Limiting**: In-memory rate limiting (100 requests per 15 minutes)
- **Input Validation**: Zod schemas for request validation
- **XSS Protection**: Input sanitization and SQL injection detection
- **CORS**: Configured for allowed origins
- **Environment Variables**: Sensitive data stored in environment variables

## Deployment

The application is configured for deployment on Cloudflare Workers via Wrangler.

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Deploy:
```bash
wrangler deploy
```

## Project Structure

```
drinqink/
├── src/
│   ├── components/       # React components
│   ├── integrations/     # External service integrations (Supabase, Paystack)
│   ├── lib/             # Utility functions and middleware
│   ├── routes/          # TanStack Router routes
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # State management
│   └── styles.css       # Global styles
├── supabase/
│   └── migrations/      # Database migrations
├── public/              # Static assets
└── wrangler.jsonc       # Cloudflare Workers configuration
```

## License

This project is private and proprietary.

## Support

For support, please contact the development team.
