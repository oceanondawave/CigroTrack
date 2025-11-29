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

| Variable                    | Description                                | Required |
| --------------------------- | ------------------------------------------ | -------- |
| `PORT`                      | Server port (default: 3001)                | No       |
| `SUPABASE_URL`              | Your Supabase project URL                  | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (from dashboard) | Yes      |
| `JWT_SECRET`                | Secret for JWT token signing               | Yes      |
| `NODE_ENV`                  | Environment (development/production)       | Yes      |

### Frontend (`.env.local`)

| Variable              | Description     | Required |
| --------------------- | --------------- | -------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes      |

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

### 🆓 Free Backend Hosting Options

#### Option 1: Render (Recommended - Free Tier Available)

**Step 1: Deploy to Render**

**Option A: Using render.yaml (Recommended - Easiest)**

1. A `render.yaml` file is already in your repo root
2. Go to [render.com](https://render.com) and sign up with GitHub
3. Click "New +" → "Blueprints"
4. Connect your GitHub repository
5. Render will auto-detect `render.yaml` and configure everything
6. You'll just need to add the secret environment variables in the dashboard

**Option B: Manual Configuration**

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

   - **Name**: `cigrotrack-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build` ⚠️ **IMPORTANT: Include `cd backend &&`**
   - **Start Command**: `cd backend && npm start` ⚠️ **IMPORTANT: Include `cd backend &&`**
   - **Plan**: **Free** (sleeps after 15min inactivity)

   **Critical:** Render may default to `yarn` or run commands from root. Always prefix with `cd backend &&` to ensure commands run in the correct directory!

5. Add Environment Variables:

   ```
   NODE_ENV=production
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=generate_with_openssl_rand_base64_32
   FRONTEND_URL=https://your-frontend-domain.com
   ```

   **Generate JWT_SECRET:** `openssl rand -base64 32`
   **Note:** Render automatically provides `PORT` environment variable - your app should use `process.env.PORT || 3001`

6. Click "Create Web Service"
7. Wait for deployment (takes 2-5 minutes)
8. Get your URL: `https://your-app.onrender.com`

**Pros:**

- ✅ Truly free tier
- ✅ Automatic HTTPS
- ✅ Easy GitHub integration
- ✅ Environment variables management

**Cons:**

- ⚠️ Service sleeps after 15min inactivity (first request takes ~30s to wake up)
- ⚠️ Limited to 512MB RAM on free tier

---

#### Option 2: Fly.io (Always Free Tier)

**Step 1: Install Fly CLI**

```bash
curl -L https://fly.io/install.sh | sh
```

**Step 2: Login**

```bash
fly auth login
```

**Step 3: Initialize App**

```bash
cd backend
fly launch
```

- Choose app name
- Select region (e.g., `iad` for US East)
- Don't deploy yet

**Step 4: Create `fly.toml`**

```toml
app = "cigrotrack-backend"
primary_region = "iad"

[build]
  builder = "paketobuildpacks/builder:base"

[env]
  NODE_ENV = "production"
  PORT = "3001"

[http_service]
  internal_port = 3001
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[services]]
  internal_port = 3001
  protocol = "tcp"
  processes = ["app"]
```

**Step 5: Set Secrets**

```bash
fly secrets set SUPABASE_URL=your_supabase_url
fly secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
fly secrets set JWT_SECRET=your_generated_secret
fly secrets set FRONTEND_URL=https://your-frontend.com
```

**Step 6: Deploy**

```bash
fly deploy
```

**Pros:**

- ✅ Always free (3 shared-cpu VMs)
- ✅ Doesn't sleep
- ✅ Global edge network
- ✅ Great for production

**Cons:**

- ⚠️ Requires CLI setup
- ⚠️ More complex initial setup

---

#### Option 3: Cyclic.sh (Free Tier)

1. Go to [cyclic.sh](https://cyclic.sh) and sign up with GitHub
2. Click "Create New App" → "Link GitHub Repository"
3. Select your repo
4. Set **Root Directory**: `backend`
5. Add environment variables in dashboard
6. Deploy automatically

**Pros:**

- ✅ Easy setup
- ✅ Auto-deploys on push
- ✅ Free tier available

---

#### Option 4: Koyeb (Free Tier)

1. Go to [koyeb.com](https://koyeb.com) and sign up
2. Create new App → Connect GitHub
3. Select repo and set root to `backend`
4. Configure build: `npm install && npm run build`
5. Configure start: `npm start`
6. Add environment variables
7. Deploy

**Pros:**

- ✅ Free tier
- ✅ No sleep (but limited resources)
- ✅ Easy setup

---

### Frontend Deployment (All Free)

#### Vercel (Recommended for Next.js)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
5. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url/api
   ```
6. Click "Deploy"
7. Get your URL: `https://your-app.vercel.app`

**Vercel is FREE forever for Next.js!** ✅

---

### Quick Setup Summary

**Recommended Free Stack:**

- **Backend**: Render.com (free tier) or Fly.io (always free)
- **Frontend**: Vercel.com (always free for Next.js)
- **Database**: Supabase.com (free tier)

**Total Cost: $0/month** 🎉

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
