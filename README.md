# Digital Marketing Resources Platform

A Next.js application for selling digital marketing resources and PDFs online. This platform allows users to browse products, make purchases using Stripe, and access PDF content after purchase.

## Features

- **Product Catalog**: Browse and search for digital marketing PDFs and resources
- **Product Details**: View detailed information about each product
- **Secure Payments**: Purchase products using Stripe
- **User Dashboard**: Access purchased PDFs and resources
- **Admin Panel**: Manage products, users, and sales
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe

## Installation

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL database
- Stripe account

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/jsa498/digitalmarketing.git
   cd digitalmarketing
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/digitalmarketing"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret"

   # Stripe
   STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
   STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment on Vercel

### Setting up Environment Variables in Vercel

1. Create a new project in Vercel and connect it to your GitHub repository.

2. In the Vercel dashboard, go to your project settings and navigate to the "Environment Variables" tab.

3. Add the following environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string (use a production database)
   - `NEXTAUTH_URL`: Your production URL (e.g., https://your-domain.vercel.app)
   - `NEXTAUTH_SECRET`: A secure random string for NextAuth
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

4. Deploy your project.

### Setting up a Production Database

For production, you can use:
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)
- [Neon](https://neon.tech/)

After setting up your production database, update the `DATABASE_URL` environment variable in Vercel.

### Setting up Stripe Webhooks for Production

1. In your Stripe dashboard, go to Developers > Webhooks.
2. Click "Add endpoint" and enter your webhook URL: `https://your-domain.vercel.app/api/webhook`.
3. Select the events to listen for (at minimum: `checkout.session.completed` and `checkout.session.expired`).
4. Copy the signing secret and add it as the `STRIPE_WEBHOOK_SECRET` environment variable in Vercel.

## Project Structure

- `/prisma`: Database schema and migrations
- `/public`: Static assets and PDF files
- `/src/app`: Next.js app router pages and API routes
- `/src/components`: Reusable React components
- `/src/lib`: Utility functions and shared code

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [Stripe](https://stripe.com/)
- [Tailwind CSS](https://tailwindcss.com/)
