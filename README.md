# CigroTrack

A modern project management and issue tracking application built with Next.js and Express.js, featuring team collaboration, kanban boards, AI-powered features, and comprehensive project analytics.

## 🚀 Features

- **Authentication**: Email/password and Google OAuth with secure cookie-based sessions
- **Team Management**: Create teams, invite members, manage roles (Owner/Admin/Member)
- **Project Management**: Organize projects by teams, archive/favorite projects
- **Issue Tracking**: Create, assign, and track issues with labels, subtasks, and priorities
- **Kanban Board**: Drag-and-drop issue management with custom statuses and WIP limits
- **AI Features**: Automated summaries, suggestions, duplicate detection, and auto-labeling
- **Comments**: Thread-based discussions on issues
- **Dashboard**: Personal, project, and team statistics and analytics
- **Notifications**: Real-time in-app notifications for team activities

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Beautiful component library
- **Framer Motion** - Smooth animations
- **React Hook Form + Zod** - Form validation

### Backend
- **Express.js** - Node.js web framework
- **Supabase** - PostgreSQL database with Row Level Security (RLS)
- **TypeScript** - Type-safe backend
- **JWT Authentication** - Secure token-based auth
- **Cookie-based Sessions** - HttpOnly cookies for security

## 📦 Project Structure

```
CigroTrack/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/       # Next.js App Router pages
│   │   ├── components/# Reusable UI components
│   │   ├── features/  # Feature-based modules (auth, teams, projects, etc.)
│   │   ├── lib/       # Utilities and API client
│   │   └── types/     # TypeScript type definitions
│   └── package.json
├── backend/           # Express.js backend API
│   ├── src/
│   │   ├── routes/    # API route handlers
│   │   ├── services/  # Business logic and database operations
│   │   ├── middleware/# Auth, error handling, etc.
│   │   ├── config/    # Configuration (Supabase client)
│   │   └── database/  # SQL schema and RLS policies
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd CigroTrack
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env  # Or create manually
```

**Backend `.env` file:**
```env
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the schema file:
   ```bash
   # Copy contents of backend/src/database/schema.sql
   # Paste and execute in Supabase SQL Editor
   ```
4. Run the RLS policies:
   ```bash
   # Copy contents of backend/src/database/rls-policies.sql
   # Paste and execute in Supabase SQL Editor
   ```

### 4. Start Backend

```bash
cd backend
npm run dev
```

Backend should be running at `http://localhost:3001`

### 5. Frontend Setup

```bash
cd frontend
npm install

# Create .env.local file
```

**Frontend `.env.local` file:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 6. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend should be running at `http://localhost:3000`

## 📝 Environment Variables

### Backend (`.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3001) | No |
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (from dashboard) | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |

### Frontend (`.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |

## 🔐 Authentication

The application uses httpOnly cookies for secure authentication:

- Cookies are set automatically by the backend after login/signup
- Cookies are sent with every API request via `credentials: "include"`
- Cookies are cleared on logout
- No client-side token storage (more secure)

## 🗄️ Database Schema

Key tables:
- `users` - User accounts
- `teams` - Team/organization data
- `team_members` - Team membership and roles
- `projects` - Project information
- `issues` - Issue/task tracking
- `comments` - Issue comments
- `custom_statuses` - Kanban board statuses
- `wip_limits` - Work-in-progress limits
- `notifications` - User notifications

All tables use Row Level Security (RLS) for data protection.

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Teams
- `GET /api/teams` - Get user's teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/invite` - Invite member
- `GET /api/teams/invites` - Get pending invitations
- `POST /api/teams/invites/:id/accept` - Accept invitation

### Projects
- `GET /api/projects` - Get projects (optional: ?teamId=xxx)
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `GET /api/projects/:id/board` - Get kanban board data
- `PUT /api/projects/:id` - Update project

### Issues
- `GET /api/issues?projectId=xxx` - Get issues
- `POST /api/issues` - Create issue
- `GET /api/issues/:id` - Get issue details
- `PUT /api/issues/:id` - Update issue

### Kanban
- `GET /api/kanban/projects/:projectId/statuses` - Get custom statuses
- `POST /api/kanban/projects/:projectId/statuses` - Create status
- `GET /api/kanban/projects/:projectId/wip-limits` - Get WIP limits

See source code for complete API documentation.

## 🚢 Deployment

### Quick Backend Deployment (Railway - Recommended)

**Step 1: Prepare**
```bash
git add .
git commit -m "Ready for deployment"
git push
```

**Step 2: Deploy to Railway**

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your CigroTrack repository
4. Go to Settings → Root Directory → Set to: `backend`
5. Add Environment Variables (Variables tab):
   ```
   PORT=3001
   NODE_ENV=production
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=generate_with_openssl_rand_base64_32
   FRONTEND_URL=https://your-frontend-domain.com
   ```
   **Generate JWT_SECRET:** `openssl rand -base64 32`
6. Railway will auto-deploy. Get your URL: `https://your-app.railway.app`

**Step 3: Update Frontend**
```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://your-app.railway.app/api
```

**Step 4: Test**
- Visit: `https://your-app.railway.app/health`
- Should return: `{"status":"ok",...}`

### Other Deployment Options

**Backend:**
- **Render**: Similar to Railway, connect GitHub repo, set root directory to `backend`
- **Fly.io**: Use Fly CLI, see [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Heroku**: Use Heroku CLI or GitHub integration

**Frontend:**
- **Vercel** (recommended): Connect GitHub, auto-detects Next.js
- **Netlify**: Connect GitHub, set build command: `npm run build`
- **AWS Amplify**: Connect repository, auto-configures

### Production Environment Variables

**Backend:**
```env
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
JWT_SECRET=your-generated-secret
FRONTEND_URL=https://your-frontend.com
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://your-backend.com/api
```

### Security Checklist
- ✅ Use strong, random JWT_SECRET (32+ chars)
- ✅ Never commit `.env` files
- ✅ Enable HTTPS (automatic on most platforms)
- ✅ Set CORS to your frontend domain only
- ✅ Verify RLS policies are active
- ✅ Monitor logs regularly

## 📚 Development

### Running in Development

```bash
# Backend
cd backend
npm run dev

# Frontend (in separate terminal)
cd frontend
npm run dev
```

### Building for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### Type Checking

```bash
# Backend
cd backend
npm run type-check

# Frontend
cd frontend
npm run type-check  # or check in IDE
```

## 🐛 Troubleshooting

### Backend won't start
- Check `.env` file exists and has all required variables
- Verify Supabase credentials are correct
- Check if port 3001 is available

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check if backend is running
- Check browser console for CORS errors

### Database errors
- Verify schema.sql and rls-policies.sql have been executed
- Check Supabase dashboard for RLS policy violations
- Ensure service role key is correct (not anon key)

### Authentication issues
- Clear browser cookies
- Check backend logs for auth errors
- Verify JWT_SECRET is set

## 📄 License

ISC

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with ❤️ for efficient project management**
