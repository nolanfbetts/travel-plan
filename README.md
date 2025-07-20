# Travel Plan - Collaborative Travel Planning App

A modern web application for collaborative travel planning with real-time task management, built with Next.js 15, Prisma, PostgreSQL, and NextAuth.

## Features

- **Trip Management**: Create and manage travel trips with multiple members
- **Collaborative Tasks**: Assign tasks to trip members with categories, priorities, and due dates
- **Real-time Updates**: Live task status updates and collaborative editing
- **Authentication**: Secure login with Google OAuth via NextAuth
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js with Google OAuth
- **Email**: Resend for email notifications
- **Deployment**: Vercel with GitHub Actions CI/CD

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Google OAuth credentials
- Resend API key (for email functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd travel-plan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/travel_plan"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Email Service (Resend)
   RESEND_API_KEY="your-resend-api-key"
   FROM_EMAIL="noreply@yourdomain.com"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Automatic Deployment (Recommended)

This project is configured for automatic deployment to Vercel via GitHub Actions.

1. **Push to GitHub**: The workflow automatically runs on pushes to `main` branch
2. **Set up Vercel secrets** in your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── trips/             # Trip pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── TaskForm.tsx       # Task creation/editing form
│   ├── TaskCard.tsx       # Task display component
│   └── ui/                # UI components
├── lib/                   # Utility functions
└── types/                 # TypeScript type definitions

prisma/
├── schema.prisma          # Database schema
└── migrations/            # Database migrations
```

## API Endpoints

### Trips
- `GET /api/trips` - Get user's trips
- `POST /api/trips` - Create new trip
- `GET /api/trips/[id]` - Get trip details
- `PUT /api/trips/[id]` - Update trip
- `DELETE /api/trips/[id]` - Delete trip

### Tasks
- `GET /api/trips/[id]/tasks` - Get trip tasks
- `POST /api/trips/[id]/tasks` - Create new task
- `GET /api/trips/[id]/tasks/[taskId]` - Get task details
- `PUT /api/trips/[id]/tasks/[taskId]` - Update task
- `DELETE /api/trips/[id]/tasks/[taskId]` - Delete task

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Build Status: ✅ SUCCESS

Your travel planning app now builds successfully for production. Here's what we fixed:

### ✅ **Critical Errors Fixed:**
1. **TypeScript `any` types** - Replaced with proper type definitions
2. **React unescaped entities** - Fixed quotes and apostrophes with HTML entities
3. **Suspense boundaries** - Wrapped `useSearchParams()` components properly

### ⚠️ **Remaining Warnings (Non-blocking):**
- Unused variables (can be cleaned up later)
- Missing useEffect dependencies (functionality still works)

## Next Steps for Deployment:

Now that your app builds successfully, you can proceed with deployment:

1. **Push your changes to GitHub:**
   ```bash
   git add .
   git commit -m "Fix build errors for production deployment"
   git push
   ```

2. **Deploy to Vercel:**
   - Go to [Vercel.com](https://vercel.com)
   - Import your `nolanfbetts/travel-plan` repository
   - Add your environment variables (DATABASE_URL, NEXTAUTH_SECRET, etc.)
   - Deploy!

Your app is now ready for production deployment! The build process is working correctly, and all critical errors have been resolved.
