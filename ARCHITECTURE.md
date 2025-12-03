# Campus Placement Interview Experience Portal - Architecture Documentation

## Project Overview
A full-stack web application for college students and alumni to share and explore campus placement interview experiences. Built with React (Vite) frontend and Express.js backend, using MongoDB for data persistence.

---

## Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Vanilla CSS** - Styling (no frameworks)

### Backend
- **Express.js 5** - Web server framework
- **MongoDB** - NoSQL database (via Mongoose ODM)
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Deployment
- **Render** - Backend hosting
- **Vercel** - Frontend hosting
- **MongoDB Atlas** - Cloud database

---

## Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   React Frontend │ ◄─────► │  Express Backend │ ◄─────► │   MongoDB Atlas  │
│   (Vite + JS)    │  HTTP   │   (REST API)     │  ODM    │   (Database)     │
│   [Vercel]       │         │   [Render]      │         │   [Cloud]        │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

---

## Backend Architecture

### 1. Server Setup (`backend/server.js`)
- **Express app initialization** - Creates HTTP server
- **CORS configuration** - Allows multiple origins (supports comma-separated list)
- **MongoDB connection** - Connects on server start
- **Route mounting** - Organizes API endpoints
- **Health check endpoint** - `/api/health` for deployment monitoring

**Key Features:**
- Dynamic CORS origin handling (production + localhost)
- JSON body parsing middleware
- Environment-based port configuration

### 2. Database Models

#### User Model (`backend/models/User.js`)
**Schema Fields:**
- `name`, `email`, `password` (hashed with bcrypt)
- `role` - Enum: 'student', 'alumni', 'admin'
- `branch`, `graduationYear`, `currentCompany`
- `profile` - Nested object (bio, linkedin, github)
- `isAlumni` - Boolean flag
- `timestamps` - Auto-generated createdAt/updatedAt

**Security Features:**
- Password hashing via `pre('save')` hook (bcrypt, salt rounds: 10)
- Password excluded from queries by default (`select: false`)
- Email validation regex
- Password minimum length: 6 characters

#### Experience Model (`backend/models/Experience.js`)
**Schema Fields:**
- `company`, `role`, `branch`, `year` - Indexed for fast queries
- `rounds` - Array of round objects (roundNumber, roundName, questions[], feedback)
- `package` - Salary package string
- `tips` - General advice
- `interviewDate` - Date field
- `offerStatus` - Enum: 'Selected', 'Not Selected', 'Pending'
- `author` - Reference to User (optional, allows anonymous)
- `authorName` - String (required, for display)
- `views`, `helpful` - Engagement metrics
- `timestamps` - Auto-generated

**Indexes:**
- Compound index on `company + role`
- Index on `branch + year`
- Descending index on `createdAt` (for recent-first sorting)

### 3. API Routes

#### Authentication Routes (`/api/auth`)
- **POST `/register`** - Create new user account
  - Validates email uniqueness
  - Hashes password automatically
  - Returns JWT token + user data
  
- **POST `/login`** - Authenticate user
  - Validates email/password
  - Returns JWT token + user data
  
- **GET `/me`** - Get current user (Protected)
  - Requires valid JWT token
  - Returns user profile

#### User Routes (`/api/users`)
- **GET `/profile`** - Get user profile (Protected)
- **PUT `/profile`** - Update user profile (Protected)

#### Experience Routes (`/api/experiences`)
- **GET `/`** - List all experiences
  - Query params: `company`, `role`, `branch`, `year`, `search`
  - Server-side filtering with MongoDB queries
  - Client-side text search across multiple fields
  - Populates author information
  - Sorted by newest first
  
- **GET `/:id`** - Get single experience
  - Validates MongoDB ObjectId format
  - Auto-increments view count
  - Populates author details
  
- **POST `/`** - Create experience (Optional Auth)
  - Works with or without authentication token
  - If authenticated: uses user's name and ID
  - If anonymous: requires `author` name in body
  - Validates required fields
  
- **PUT `/:id`** - Update experience (Protected)
  - Only author or admin can update
  
- **DELETE `/:id`** - Delete experience (Protected)
  - Only author or admin can delete

#### Company Routes (`/api/companies`)
- **GET `/`** - Get company statistics
  - Aggregates all experiences by company
  - Returns: total experiences, unique roles, branches, years, packages per company

#### Insights Routes (`/api/insights`)
- **GET `/`** - Get analytics dashboard data
  - **Overview stats**: total experiences, unique companies/roles, avg/min/max package
  - **Frequent questions**: Top 10 most asked interview questions
  - **Distributions**: Company, year, role frequency charts
  - **Package trends**: Top 10 highest packages

### 4. Middleware

#### Authentication Middleware (`backend/middleware/auth.js`)
- **`protect`** - Verifies JWT token
  - Extracts token from `Authorization: Bearer <token>` header
  - Verifies token signature with JWT_SECRET
  - Attaches user object to `req.user`
  - Returns 401 if invalid/missing token

- **`authorize(...roles)`** - Role-based access control
  - Checks if user role is in allowed list
  - Returns 403 if unauthorized

#### Token Generation (`backend/utils/generateToken.js`)
- Creates JWT with user ID payload
- Expires in 30 days (configurable via JWT_EXPIRE)

---

## Frontend Architecture

### 1. Application Structure

```
frontend/src/
├── App.jsx              # Root component with routing
├── main.jsx             # React entry point
├── index.css            # Global styles + CSS variables
├── services/
│   └── api.js           # API client (centralized HTTP calls)
├── components/
│   ├── Layout.jsx       # App shell (header, footer, navigation)
│   ├── Layout.css
│   ├── ExperienceCard.jsx    # Reusable experience card
│   ├── ExperienceCard.css
│   ├── FilterBar.jsx         # Search and filter controls
│   └── FilterBar.css
└── pages/
    ├── Home.jsx              # Landing page
    ├── Home.css
    ├── ExperienceList.jsx   # Browse experiences with filters
    ├── ExperienceList.css
    ├── ExperienceDetail.jsx # Single experience view
    ├── ExperienceDetail.css
    ├── CreateExperience.jsx  # Form to submit experience
    ├── CreateExperience.css
    ├── Insights.jsx          # Analytics dashboard
    └── Insights.css
```

### 2. Routing (`App.jsx`)
- **`/`** - Home page (hero, features, CTA)
- **`/experiences`** - Experience list with filters
- **`/experiences/:id`** - Single experience detail
- **`/create`** - Create new experience form
- **`/insights`** - Analytics dashboard

### 3. API Client (`services/api.js`)
**Features:**
- Dynamic API base URL resolution:
  - Uses `VITE_API_BASE_URL` if set
  - Auto-detects Vercel deployment → uses Render backend
  - Falls back to `localhost:3001` for development
- Centralized error handling
- Helper functions for all API endpoints

**Exports:**
- `experiencesAPI` - getAll, getById, create, update, delete
- `companiesAPI` - getAll
- `insightsAPI` - getAll

### 4. Key Components

#### Layout Component
- **Responsive navigation bar**
  - Fixed on Home page (frosted glass effect)
  - Scrolls with page on other routes
  - Centered, pill-shaped design with backdrop blur
- **Footer** - Copyright and description
- **Container wrapper** - Consistent max-width and padding

#### FilterBar Component
- **Search input** - Debounced (300ms delay) to prevent excessive API calls
- **Filter dropdowns** - Company, Role, Branch, Year
- **Clear filters button**
- **Optimized with React.memo** - Prevents unnecessary re-renders

#### ExperienceCard Component
- Displays: company, role, branch, year, author, offer status
- Links to detail page using `experience._id`
- Responsive grid layout

### 5. Pages

#### Home Page
- Hero section with CTA buttons
- Features grid (3 cards)
- Call-to-action section
- Fixed navbar with frosted glass effect

#### ExperienceList Page
- **State management:**
  - `experiences` - Array of experience objects
  - `filters` - Object with company, role, branch, year
  - `searchTerm` - Text search input
  - `debouncedSearchTerm` - Delayed search for performance
- **Optimizations:**
  - `useCallback` for filter handlers
  - `useMemo` for filtered results
  - Debounced search (300ms)
- **Loading states** - Initial load vs. filter updates
- **Error handling** - User-friendly error messages

#### ExperienceDetail Page
- Fetches single experience by ID
- Displays all rounds with questions and feedback
- Shows package, tips, interview date, offer status
- Author information display

#### CreateExperience Page
- Multi-step form for experience submission
- Dynamic round addition/removal
- Form validation
- Supports anonymous submissions (name field)

#### Insights Page
- Displays overview statistics cards
- Charts for company/role/year distributions
- Top 10 frequent questions list
- Package trends visualization

### 6. Styling Approach
- **CSS Variables** - Centralized color scheme and spacing
- **Global styles** - Fixed radial gradient background
- **Component-scoped CSS** - Each component has its own stylesheet
- **Responsive design** - Mobile-first with media queries
- **Modern UI effects:**
  - Frosted glass (backdrop-filter)
  - Smooth transitions
  - Hover effects
  - Card shadows

---

## Security Features

1. **Password Security**
   - Bcrypt hashing (10 salt rounds)
   - Passwords never returned in API responses

2. **Authentication**
   - JWT tokens for stateless auth
   - Token expiration (30 days)
   - Protected routes require valid token

3. **CORS Protection**
   - Whitelist-based origin validation
   - Supports multiple allowed origins
   - Credentials enabled for authenticated requests

4. **Input Validation**
   - MongoDB ObjectId validation
   - Email format validation
   - Required field checks
   - Enum validation for roles/status

5. **Authorization**
   - Users can only edit/delete their own experiences
   - Admin role can manage all content

---

## Deployment Architecture

### Backend (Render)
- **Service type:** Web service
- **Build command:** `npm install`
- **Start command:** `node server.js`
- **Health check:** `/api/health`
- **Environment variables:**
  - `MONGODB_URI` - MongoDB Atlas connection string
  - `JWT_SECRET` - Secret key for token signing
  - `JWT_EXPIRE` - Token expiration (30d)
  - `CORS_ORIGIN` - Allowed frontend origins (comma-separated)
  - `PORT` - Server port (auto-set by Render)

### Frontend (Vercel)
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variables:**
  - `VITE_API_BASE_URL` - Optional backend URL override

### Database (MongoDB Atlas)
- Cloud-hosted MongoDB cluster
- Connection via connection string
- Automatic backups and scaling

---

## Data Flow

### Creating an Experience
1. User fills form on `/create` page
2. Frontend calls `experiencesAPI.create(experienceData)`
3. API client sends POST to `/api/experiences`
4. Backend validates data
5. If token present: extracts user info, else uses provided name
6. Creates Experience document in MongoDB
7. Returns created experience with populated author
8. Frontend redirects to experience list

### Filtering Experiences
1. User applies filters on `/experiences` page
2. FilterBar updates state (debounced for search)
3. `ExperienceList` component calls `experiencesAPI.getAll(filters)`
4. Backend builds MongoDB query from filter params
5. Executes query with indexes for performance
6. Returns filtered array
7. Frontend renders cards in grid layout

### Viewing Insights
1. User navigates to `/insights`
2. Frontend calls `insightsAPI.getAll()`
3. Backend aggregates all experiences
4. Calculates statistics (averages, distributions, frequencies)
5. Returns structured JSON
6. Frontend renders charts and statistics

---

## Performance Optimizations

1. **Database Indexes** - Fast queries on company, role, branch, year
2. **Debounced Search** - Reduces API calls during typing
3. **React.memo** - Prevents unnecessary component re-renders
4. **useCallback/useMemo** - Optimizes filter handlers and computed values
5. **Lazy Loading** - Components load on demand via routing
6. **MongoDB Population** - Efficiently loads related User data

---

## Key Features Summary

✅ **User Authentication** - Register, login, JWT-based sessions  
✅ **Experience Sharing** - Anonymous or authenticated submissions  
✅ **Advanced Filtering** - Company, role, branch, year, text search  
✅ **Data Insights** - Analytics dashboard with statistics  
✅ **Responsive Design** - Mobile-friendly UI  
✅ **Real-time Updates** - View count tracking  
✅ **Role-based Access** - Student, alumni, admin roles  
✅ **Secure API** - Protected routes, input validation  
✅ **Production Ready** - Deployed on Render + Vercel  

---

## Environment Variables

### Backend (.env or Render)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
CORS_ORIGIN=https://your-frontend.vercel.app,http://localhost:5173
PORT=3001
```

### Frontend (.env or Vercel)
```
VITE_API_BASE_URL=https://your-backend.onrender.com
```

---

## Future Enhancements (Not Implemented)
- Email verification
- Password reset functionality
- Experience upvoting/downvoting
- Comments on experiences
- User profiles with experience history
- Admin dashboard
- Real-time notifications
- Advanced search with MongoDB text indexes

