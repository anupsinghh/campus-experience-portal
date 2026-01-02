# Campus Placement Interview Experience Portal

A full-stack web application for college students and alumni to share and explore campus placement interview experiences. This platform helps students prepare for placements by learning from real interview experiences shared by their peers and alumni.

## 🌟 Features

### For Students
- **Browse Interview Experiences** - Search and filter experiences by company, role, branch, and year
- **Share Your Experience** - Post detailed placement interview experiences including:
  - Company and role information
  - Placement rounds with questions asked
  - Feedback and tips for each round
  - Salary package information
  - General preparation tips
- **Search Questions** - Find specific interview questions by company and role
- **View Insights** - Analytics and statistics about placements
- **User Profiles** - Create and manage your profile
- **Comments** - Engage with experiences through comments

### For Alumni
- All student features plus:
- Alumni badge and recognition
- Share current company information
- Help current students with placement preparation

### For Administrators
- **Moderation Dashboard** - Review and approve/reject submitted experiences
- **User Management** - View and manage all registered users
- **Reports Management** - Handle user reports on experiences
- **Announcements** - Create and manage public announcements
- **Company Standardization** - Standardize company name variations
- **Analytics** - View platform statistics and insights

## 🚀 Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Vanilla CSS** - Custom styling (no frameworks)
- **Chart.js** - Data visualization
- **jsPDF** - PDF generation

### Backend
- **Node.js** - Runtime environment
- **Express.js 5** - Web server framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Cloud database

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **MongoDB** (local or MongoDB Atlas account)
- **Git**

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/campus-placement-portal.git
cd campus-placement-portal
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/placement-portal?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Port
PORT=3001

# CORS Origins (comma-separated or * for all)
CORS_ORIGIN=*
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional):

```env
# API Base URL (optional - defaults to localhost:3001 in dev)
VITE_API_BASE_URL=http://localhost:3001
```

## 🚀 Running the Application

### Development Mode

#### Start Backend Server

```bash
cd backend
npm start
# or
node server.js
```

The backend server will run on `http://localhost:3001`

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

### Production Build

#### Build Frontend

```bash
cd frontend
npm run build
```

The production build will be in the `frontend/dist` directory.

#### Start Backend (Production)

```bash
cd backend
npm start
```

## 📁 Project Structure

```
campus-placement-portal/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Experience.js        # Experience model
│   │   ├── Comment.js           # Comment model
│   │   ├── Report.js            # Report model
│   │   ├── Announcement.js      # Announcement model
│   │   └── CompanyStandardization.js
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── experiences.js       # Experience routes
│   │   ├── users.js             # User routes
│   │   ├── comments.js          # Comment routes
│   │   ├── admin.js             # Admin routes
│   │   ├── announcements.js    # Announcement routes
│   │   ├── companies.js        # Company routes
│   │   └── insights.js         # Insights routes
│   ├── utils/
│   │   └── generateToken.js     # JWT token generation
│   ├── server.js                # Express server setup
│   └── package.json
├── frontend/
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── context/             # React context providers
│   │   ├── services/            # API service layer
│   │   ├── App.jsx              # Main app component
│   │   └── main.jsx             # Entry point
│   ├── package.json
│   └── vite.config.js
├── README.md
├── ARCHITECTURE.md
└── .gitignore
```

## 🔐 Authentication

### Default Admin Credentials

- **Email/Username**: `admin@marwadiuniversity.ac.in` or `admin`
- **Password**: `admin123`

**Note**: Change these credentials in production!

### User Registration

- Email must be from `@marwadiuniversity.ac.in` or `@marwadiuniversity.edu.in` domain
- Username must be 3-20 characters, lowercase letters, numbers, and underscores only
- Password must be at least 6 characters

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Experiences
- `GET /api/experiences` - Get all approved experiences
- `GET /api/experiences/:id` - Get single experience
- `POST /api/experiences` - Create new experience (Optional auth)
- `GET /api/experiences/my` - Get user's experiences (Protected)
- `PUT /api/experiences/:id` - Update experience (Protected)
- `DELETE /api/experiences/:id` - Delete experience (Protected)

### Admin
- `GET /api/admin/stats` - Get platform statistics (Admin)
- `GET /api/admin/experiences/pending` - Get pending experiences (Admin)
- `GET /api/admin/experiences?status=approved` - Get experiences by status (Admin)
- `PUT /api/admin/experiences/:id/approve` - Approve experience (Admin)
- `PUT /api/admin/experiences/:id/reject` - Reject experience (Admin)
- `GET /api/admin/users` - Get all users (Admin)
- `GET /api/admin/reports` - Get all reports (Admin)
- `POST /api/admin/announcements` - Create announcement (Admin)

See `ARCHITECTURE.md` for complete API documentation.

## 🌐 Environment Variables

### Backend (.env)

```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
PORT=3001
CORS_ORIGIN=*
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:3001
```

## 🚢 Deployment

### Backend (Render)

1. Connect your GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables in Render dashboard
5. Deploy

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables if needed
6. Deploy

## 🧪 Testing

Currently, the project doesn't include automated tests. To add tests:

```bash
# Backend
cd backend
npm install --save-dev jest supertest

# Frontend
cd frontend
npm install --save-dev vitest @testing-library/react
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Marwadi University for the domain requirements
- All contributors and students who share their experiences

## 📞 Support

For support, email support@marwadiuniversity.ac.in or open an issue in the repository.

## 🔄 Version History

- **v1.0.0** - Initial release
  - User authentication and registration
  - Experience sharing and browsing
  - Admin moderation dashboard
  - User management
  - Announcements system
  - Company standardization

---

**Made with ❤️ for students preparing for campus placements**
