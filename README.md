# OFA - Personal Life Operating System

Your life deserves an operating system. OFA is a personal productivity and self-management platform that connects your identity, actions, and outcomes in one unified system.

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Express.js + Passport.js
- **Database**: PostgreSQL
- **Session Store**: PostgreSQL (connect-pg-simple)

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd One-for-all
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```bash
# Server
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-super-secret-session-key-change-in-production

# PostgreSQL Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ofa_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ofa_db
DB_USER=postgres
DB_PASSWORD=password

# Connection pool
DB_POOL_MIN=2
DB_POOL_MAX=10
```

Update the PostgreSQL credentials to match your local setup.

### 3. Initialize Database

Make sure PostgreSQL is running, then:

```bash
# Create database and tables
npm run db:init

# (Optional) Seed with demo data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

This starts both:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 📁 Project Structure

```
One-for-all/
├── index.html                # React entry point
├── package.json
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.js
│
├── src/                     # React Frontend
│   ├── main.jsx             # React entry
│   ├── App.jsx              # App with routing
│   ├── index.css            # Tailwind styles
│   ├── context/
│   │   └── AuthContext.jsx  # Auth state management
│   └── pages/
│       ├── Landing.jsx      # Landing page
│       ├── Login.jsx        # Login page
│       ├── Signup.jsx       # Signup page
│       ├── Onboarding.jsx   # 7-step onboarding
│       └── Dashboard.jsx    # User dashboard
│
├── server/                  # Express Backend
│   ├── index.js             # Server entry
│   ├── config/
│   │   └── passport.js      # Passport.js config
│   ├── db/
│   │   ├── config.js        # PostgreSQL connection
│   │   ├── schema.sql       # Database schema
│   │   ├── init.js          # Initialize database
│   │   ├── seed.js          # Seed demo data
│   │   └── reset.js         # Reset database
│   ├── models/
│   │   └── user.js          # User model
│   └── routes/
│       ├── auth.js          # Auth routes
│       └── profile.js       # Profile routes
│
└── public/
    └── favicon.svg
```

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Logout current user |
| GET | `/api/auth/me` | Get current user |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update profile |
| POST | `/api/profile/onboarding` | Update onboarding step |
| POST | `/api/profile/identity` | Update identity (vision, values, roles) |
| POST | `/api/profile/context` | Update life context |
| POST | `/api/profile/preferences` | Update preferences |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| POST | `/api/waitlist` | Join waitlist |

## 🗄️ Database Schema

### Tables
- `users` - User accounts and profile data
- `user_values` - User's selected values
- `user_roles` - User's life roles
- `user_focus_areas` - User's focus areas
- `goals` - User goals (future expansion)
- `tasks` - Tasks linked to goals
- `journal_entries` - Daily journal entries
- `waitlist` - Waitlist signups
- `session` - Express sessions

## 📦 NPM Scripts

```bash
# Development
npm run dev           # Start both frontend and backend
npm run dev:client    # Start only Vite dev server
npm run dev:server    # Start only Express server

# Database
npm run db:init       # Initialize database
npm run db:seed       # Seed demo data
npm run db:reset      # Reset all tables

# Production
npm run build         # Build frontend
npm start             # Start production server
```

## 🎯 Features

### Authentication
- Email/password signup and login
- Secure password hashing (bcrypt)
- Session-based authentication
- PostgreSQL session store

### Onboarding (7 Steps)
1. **Welcome** - Personalized greeting
2. **Vision** - Define 3-year vision
3. **Values** - Select 3-5 core values
4. **Roles** - Identify life roles
5. **Focus Areas** - Choose struggle areas
6. **First Goal** - Set initial goal
7. **Preferences** - Configure system

### Dashboard
- Identity overview (vision, values, roles)
- Daily focus tasks
- Quick actions
- Daily reflection
- Insights and patterns

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- Session secrets for signing
- HTTP-only cookies
- CORS protection
- SQL injection prevention (parameterized queries)

## 📝 License

MIT

---

Built with intention. Design your life. 🧠
