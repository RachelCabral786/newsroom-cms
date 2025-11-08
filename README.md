# 📰 Newsroom CMS
A professional, full-stack Content Management System designed for newsrooms with role-based access control and real-time notifications.

## ✨ Features

### Core Functionality
- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 👥 **Role-Based Access Control** - Four distinct roles (Admin, Editor, Writer, Reader)
- 📝 **Rich Text Editor** - Professional article creation with React Quill
- 🔄 **Article Workflow** - Complete submission → review → publish pipeline
- 🔔 **Real-Time Notifications** - Instant updates via Socket.io
- 🔍 **Search & Filter** - Advanced article search and filtering

### User Roles & Capabilities
#### 🔒 Admin
- View and manage all users
- Promote/demote between Editor and Writer roles
- Access comprehensive analytics
- View all articles across the system

#### ✍️ Editor
- Review submitted articles
- Approve or reject with comments
- Track review history
- View approved and rejected articles

#### 📄 Writer
- Create and edit articles
- Submit to editors for review
- Track article status
- Resubmit rejected articles

#### 👀 Reader
- Browse approved articles
- Search by title or author
- Read published content

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time:** Socket.io
- **Security:** bcryptjs, sanitize-html
- **Validation:** express-validator

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Rich Text:** React Quill
- **Notifications:** React Toastify
- **Real-time:** Socket.io Client

## 🚀 Getting Started

### Prerequisites
- Node.js (v20.19+ or v22.12+)
- MongoDB (v4+)
- npm or yarn

### Installation
1. **Clone the repository**
```bash
git clone https://github.com/RachelCabral786/newsroom-cms.git
cd newsroom-cms
```

2. **Install backend dependencies**
```bash
cd server
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Install frontend dependencies**
```bash
cd ../client
npm install
```

5. **Start MongoDB**
```bash
mongod
```

### Running the Application

**Development Mode:**

Open two terminal windows:
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

## 👤 Test Users

| Role   | Email               | Password  |
|--------|---------------------|-----------|
| Admin  | admin@newsroom.com  | admin123  |
| Editor | editor@newsroom.com | editor123 |
| Writer | writer@newsroom.com | writer123 |
| Reader | reader@newsroom.com | reader123 |

## 📁 Project Structure

```text
newsroom-cms/
├── client/                     # React frontend
|   ├── public/
|   └── src/
|       ├── components/         # Reusable components
|       |   ├── common/
|       |   └── layout/
|       ├── context/            # React Context (Auth, Socket)
|       ├── pages/              # Page components
|       |   ├── articles/
|       |   ├── auth/
|       |   └── dashboard/
|       ├── services/           # API services
|       ├── App.css
|       ├── App.jsx
|       ├── index.css
|       └── main.jsx
└── server/                     # Express backend
    ├── config/                 # Configuration files
    ├── controllers/            # Route controllers
    ├── middleware/             # Custom middleware
    ├── models/                 # Mongoose models
    ├── routes/                 # API routes
    ├── utils/                  # Utility functions
    └── server.js               # Entry point

##  🔒 API Endpoints

1. **Authentication**
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user
- PUT /api/auth/updatepassword - Update password

2. **Users (admin)**
- GET /api/users - Get all users
- GET /api/users/editors - Get all editors
- GET /api/users/:id - Get user by ID
- PUT /api/users/:id/role - Update user role
- PUT /api/users/:id/toggle-status - Toggle user status

3. **Articles**
- POST /api/articles - Create article
- GET /api/articles - Get articles (filtered by role)
- GET /api/articles/:id - Get article by ID
- PUT /api/articles/:id - Update article
- DELETE /api/articles/:id - Delete article
- PUT /api/articles/:id/submit - Submit for review
- PUT /api/articles/:id/approve - Approve article (Editor)
- PUT /api/articles/:id/reject - Reject article (Editor)
- GET /api/articles/search - Search articles

## Features in Detail

### Real-Time Notifications:
Writers receive instant notifications when their articles are-
✅ Approved by editors
❌ Rejected with feedback
📝 Require revisions

### Article Workflow:
- Draft → Writer creates article
- Submitted → Article sent to specific editor
- Under Review → Editor reviews content
- Approved/Rejected → Editor decision with optional comments
- Resubmission → Writer can edit and resubmit rejected articles

### Security Features:
- Password hashing with bcrypt
- JWT token-based authentication
- HTML sanitization for XSS prevention
- Role-based route protection
- Input validation and sanitization

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


⭐ Star this repository if you find it helpful!