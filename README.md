# Bigbull Trading Academy - Lead Management CRM

A production-ready, scalable Lead Management CRM built for Bigbull Trading Academy. This system helps manage leads through a 7-day funnel with features for tracking, follow-ups, templates, and team collaboration.

## Features

### Core CRM Features
- **Lead Capture Form**: Capture leads with name, phone, email, interest, source, funnel day, status, tags, and notes
- **Lead List**: Sortable & filterable by source, status, funnel day, next action, and tags with search functionality
- **Lead Detail Page**: Full timeline of notes & interactions with edit capabilities
- **Follow-Up Templates**: Pre-built templates for Day 0-7 funnel stages
- **CSV Import/Export**: Bulk lead management via CSV files
- **Lead Table Export**: Generate compact tables for copying into chat/WhatsApp

### Additional Features
- **Dashboard**: Real-time statistics with lead counts, funnel distribution, and upcoming follow-ups
- **Quick Actions**: One-click call, WhatsApp, and email simulation
- **Role-Based Auth**: Admin and Agent roles with different permissions
- **Mobile Responsive**: Works on all device sizes
- **Activity Timeline**: Track all interactions with leads

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: JWT-based auth with HTTP-only cookies

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth pages (login, register)
│   ├── (dashboard)/      # Protected pages (dashboard, leads, templates, settings)
│   └── api/              # API routes
├── components/           # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and database connection
├── models/              # MongoDB schemas
└── types/               # TypeScript types
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database (local or MongoDB Atlas)

### Environment Setup

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bigbull-crm
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:5000`

### Seed Demo Data

1. Start the application
2. Navigate to Settings page or click "Seed Demo Data" on the dashboard
3. This creates:
   - Admin user: `admin@bigbull.com` / `admin123`
   - Agent user: `agent@bigbull.com` / `agent123`
   - 10 sample leads
   - 8 follow-up templates (Day 0-7)

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/leads` | List leads (with filters) |
| POST | `/api/leads` | Create new lead |
| GET | `/api/leads/:id` | Get lead details |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| POST | `/api/leads/:id/actions` | Add note/schedule follow-up |
| POST | `/api/leads/import` | Import leads from CSV |
| GET | `/api/leads/export` | Export leads to CSV |
| GET | `/api/leads/stats` | Get dashboard statistics |
| PUT | `/api/leads/bulk` | Bulk update leads |
| DELETE | `/api/leads/bulk` | Bulk delete leads |
| GET | `/api/templates` | List templates |
| POST | `/api/templates` | Create template |
| POST | `/api/send-template` | Send template to lead |
| POST | `/api/seed` | Seed demo data |

## CSV Import/Export

### Import CSV Format
Your CSV should have these columns:
```
Name,Phone,Email,Interest,Source,Funnel Day,Status,Tags,Notes,Next Action
Rahul Kumar,+91 98765 43210,rahul@email.com,Options Trading,GMB,0,Hot,"new,interested",Called today,Follow up tomorrow
```

### Export
1. Go to Leads page
2. Apply filters if needed
3. Select leads (optional - exports all filtered if none selected)
4. Click "Export" button

### Send Lead Table
1. Go to Leads page
2. Select leads or apply filters
3. Click "Copy Table" button
4. Paste the markdown table in WhatsApp/chat

## User Roles

### Admin
- Full access to all features
- Manage users and settings
- Delete leads and bulk actions
- Create and manage templates

### Agent
- View and update leads
- Add notes and activities
- Use templates
- Export leads

## Deployment (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
4. Deploy

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## License

Private - Bigbull Trading Academy
