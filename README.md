# University Maintenance Request System (UniMaintain)

A full-stack web application for managing maintenance requests in a university environment. Built for MIT 8333 Web Application Development course.

## 🌐 Live Demo

- **Frontend**: https://web-app-anita-ssmuel-anitas-projects-268b811e.vercel.app
- **Backend API**: https://web-app-anita-ssmuel.onrender.com
- **API Health Check**: https://web-app-anita-ssmuel.onrender.com/api/health

### Demo Accounts

| Role                | Email                           | Password    |
| ------------------- | ------------------------------- | ----------- |
| Admin               | admin@university.edu            | password123 |
| Maintenance Officer | john.maintenance@university.edu | password123 |
| Maintenance Officer | mary.maintenance@university.edu | password123 |
| Staff               | lecturer@university.edu         | password123 |
| Student             | student@university.edu          | password123 |
| Student             | student2@university.edu         | password123 |

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [API Documentation](#api-documentation)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Features](#features)
8. [Installation & Setup](#installation--setup)
9. [Deployment](#deployment)
10. [Project Structure](#project-structure)

---

## 🎯 Project Overview

UniMaintain is a comprehensive maintenance request management system designed for universities. It enables students and staff to submit maintenance requests, allows maintenance officers to manage assigned tasks, and provides administrators with full oversight of the system.

### Problem Statement

Universities face challenges in managing maintenance requests efficiently:

- Paper-based or email-based systems are slow and error-prone
- Lack of transparency in request status tracking
- Difficulty in prioritizing and assigning tasks
- No centralized reporting for maintenance metrics

### Solution

UniMaintain provides:

- Digital submission and tracking of maintenance requests
- Role-based access control for different user types
- Real-time status updates and notifications
- Comprehensive admin dashboard with analytics
- Mobile-responsive design for on-the-go access

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Next.js Frontend                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │   Pages     │  │ Components  │  │    State (Zustand)  │  │   │
│  │  │  (App Router)│  │  (UI/Layout)│  │                     │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  │                         │                                     │   │
│  │                    Axios API Client                          │   │
│  └─────────────────────────┼────────────────────────────────────┘   │
│                            │ HTTPS                                  │
│                    Vercel Edge Network                              │
└────────────────────────────┼────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          SERVER LAYER                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  Express.js Backend                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │   Routes    │  │ Middleware  │  │    Controllers      │  │   │
│  │  │  /api/*     │  │ Auth/CORS   │  │  Business Logic     │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  │                         │                                     │   │
│  │                    Prisma ORM                                │   │
│  └─────────────────────────┼────────────────────────────────────┘   │
│                            │                                        │
│                      Render Cloud                                   │
└────────────────────────────┼────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   PostgreSQL Database                        │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐ │   │
│  │  │   User    │  │  Request  │  │  Category │  │  Comment  │ │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                      Render PostgreSQL                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Architecture Pattern: Three-Tier Architecture

1. **Presentation Layer (Client)**
   - Next.js with App Router for server-side rendering and routing
   - React components for UI
   - Zustand for lightweight state management
   - Tailwind CSS for styling

2. **Application Layer (Server)**
   - Express.js REST API
   - JWT-based authentication
   - Middleware for auth, validation, error handling
   - Business logic in route handlers

3. **Data Layer (Database)**
   - PostgreSQL relational database
   - Prisma ORM for type-safe database operations
   - Migrations for schema versioning

### Request Flow

```
User Action → React Component → Zustand Store → Axios API Call
    ↓
Express Router → Auth Middleware → Route Handler → Prisma Query
    ↓
PostgreSQL → Response → JSON → Update Store → Re-render UI
```

---

## 🛠️ Technology Stack

### Frontend

| Technology          | Purpose                         |
| ------------------- | ------------------------------- |
| **Next.js 16**      | React framework with App Router |
| **TypeScript**      | Type-safe JavaScript            |
| **Tailwind CSS**    | Utility-first CSS framework     |
| **Zustand**         | Lightweight state management    |
| **React Hook Form** | Form handling with validation   |
| **Zod**             | Schema validation               |
| **Axios**           | HTTP client                     |
| **Lucide React**    | Icon library                    |
| **js-cookie**       | Cookie management               |

### Backend

| Technology       | Purpose                       |
| ---------------- | ----------------------------- |
| **Node.js**      | JavaScript runtime            |
| **Express.js 5** | Web framework                 |
| **TypeScript**   | Type-safe JavaScript          |
| **Prisma 5**     | ORM for database operations   |
| **PostgreSQL**   | Relational database           |
| **JWT**          | Authentication tokens         |
| **bcryptjs**     | Password hashing              |
| **Helmet**       | Security headers              |
| **CORS**         | Cross-origin resource sharing |
| **Morgan**       | HTTP request logging          |

### DevOps & Deployment

| Technology            | Purpose                |
| --------------------- | ---------------------- |
| **Vercel**            | Frontend hosting & CDN |
| **Render**            | Backend hosting        |
| **Render PostgreSQL** | Managed database       |
| **GitHub**            | Version control        |

---

## 🗄️ Database Design

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────┐       ┌─────────────────┐
│      User       │       │   ServiceRequest    │       │ RequestCategory │
├─────────────────┤       ├─────────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)             │   ┌───│ id (PK)         │
│ email           │   │   │ title               │   │   │ name            │
│ password        │   │   │ description         │   │   │ description     │
│ firstName       │   └──▶│ requesterId (FK)    │   │   │ icon            │
│ lastName        │       │ categoryId (FK)     │◀──┘   │ createdAt       │
│ role            │   ┌──▶│ assignedOfficerId   │       │ updatedAt       │
│ department      │   │   │ status              │       └─────────────────┘
│ phone           │   │   │ priority            │
│ createdAt       │───┘   │ location            │       ┌─────────────────┐
│ updatedAt       │       │ createdAt           │       │    Comment      │
└─────────────────┘       │ updatedAt           │       ├─────────────────┤
                          │ resolvedAt          │   ┌──▶│ id (PK)         │
                          └─────────────────────┘   │   │ content         │
                                    │               │   │ authorId (FK)   │
                                    └───────────────┴───│ requestId (FK)  │
                                                        │ createdAt       │
                                                        └─────────────────┘
```

### Database Schema

```prisma
enum Role {
  STUDENT
  STAFF
  MAINTENANCE_OFFICER
  ADMIN
}

enum RequestStatus {
  PENDING
  ASSIGNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model User {
  id                String           @id @default(cuid())
  email             String           @unique
  password          String
  firstName         String
  lastName          String
  role              Role             @default(STUDENT)
  department        String?
  phone             String?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  submittedRequests ServiceRequest[] @relation("RequesterRequests")
  assignedRequests  ServiceRequest[] @relation("OfficerRequests")
  comments          Comment[]
}

model RequestCategory {
  id          String           @id @default(cuid())
  name        String           @unique
  description String?
  icon        String?
  requests    ServiceRequest[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}

model ServiceRequest {
  id               String          @id @default(cuid())
  title            String
  description      String
  status           RequestStatus   @default(PENDING)
  priority         Priority        @default(MEDIUM)
  location         String
  category         RequestCategory @relation(fields: [categoryId], references: [id])
  categoryId       String
  requester        User            @relation("RequesterRequests", fields: [requesterId], references: [id])
  requesterId      String
  assignedOfficer  User?           @relation("OfficerRequests", fields: [assignedOfficerId], references: [id])
  assignedOfficerId String?
  comments         Comment[]
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
  resolvedAt       DateTime?
}

model Comment {
  id        String         @id @default(cuid())
  content   String
  author    User           @relation(fields: [authorId], references: [id])
  authorId  String
  request   ServiceRequest @relation(fields: [requestId], references: [id])
  requestId String
  createdAt DateTime       @default(now())
}
```

---

## 📡 API Documentation

Base URL: `https://web-app-anita-ssmuel.onrender.com/api`

### Authentication Endpoints

| Method | Endpoint                | Description       | Auth Required |
| ------ | ----------------------- | ----------------- | ------------- |
| POST   | `/auth/register`        | Register new user | No            |
| POST   | `/auth/login`           | User login        | No            |
| GET    | `/auth/me`              | Get current user  | Yes           |
| PUT    | `/auth/profile`         | Update profile    | Yes           |
| PUT    | `/auth/change-password` | Change password   | Yes           |

### Request Endpoints

| Method | Endpoint                 | Description         | Auth Required       |
| ------ | ------------------------ | ------------------- | ------------------- |
| GET    | `/requests`              | Get user's requests | Yes                 |
| POST   | `/requests`              | Create new request  | Yes (Student/Staff) |
| GET    | `/requests/:id`          | Get request details | Yes                 |
| PUT    | `/requests/:id`          | Update request      | Yes                 |
| POST   | `/requests/:id/comments` | Add comment         | Yes                 |
| PUT    | `/requests/:id/status`   | Update status       | Yes (Officer/Admin) |
| PUT    | `/requests/:id/assign`   | Assign officer      | Yes (Admin)         |

### Category Endpoints

| Method | Endpoint          | Description        | Auth Required |
| ------ | ----------------- | ------------------ | ------------- |
| GET    | `/categories`     | Get all categories | Yes           |
| POST   | `/categories`     | Create category    | Yes (Admin)   |
| PUT    | `/categories/:id` | Update category    | Yes (Admin)   |
| DELETE | `/categories/:id` | Delete category    | Yes (Admin)   |

### Admin Endpoints

| Method | Endpoint                | Description      | Auth Required |
| ------ | ----------------------- | ---------------- | ------------- |
| GET    | `/admin/dashboard`      | Dashboard stats  | Yes (Admin)   |
| GET    | `/admin/requests`       | All requests     | Yes (Admin)   |
| GET    | `/admin/users`          | All users        | Yes (Admin)   |
| PUT    | `/admin/users/:id/role` | Update user role | Yes (Admin)   |
| GET    | `/admin/reports`        | Generate reports | Yes (Admin)   |

### User Endpoints

| Method | Endpoint          | Description       | Auth Required |
| ------ | ----------------- | ----------------- | ------------- |
| GET    | `/users/officers` | Get all officers  | Yes (Admin)   |
| GET    | `/users/tasks`    | Get officer tasks | Yes (Officer) |

### Example API Responses

**Login Success:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cmrpv0afw0006qpwz0p3pi5g7",
      "email": "admin@university.edu",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN",
      "department": "IT Department"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Create Request:**

```json
{
  "success": true,
  "message": "Request created successfully",
  "data": {
    "id": "cmrpv1abc0007qpwz1a2b3c4d",
    "title": "Broken AC in Room 101",
    "description": "The air conditioner is not cooling properly",
    "status": "PENDING",
    "priority": "HIGH",
    "location": "Building A, Room 101",
    "category": {
      "name": "Classroom Equipment",
      "icon": "🖥️"
    },
    "createdAt": "2026-07-18T10:30:00.000Z"
  }
}
```

---

## 👥 User Roles & Permissions

### Role Hierarchy

```
ADMIN (Full Access)
  │
  ├── MAINTENANCE_OFFICER (Task Management)
  │
  └── STAFF / STUDENT (Request Submission)
```

### Permissions Matrix

| Feature               | Student | Staff | Officer | Admin |
| --------------------- | :-----: | :---: | :-----: | :---: |
| Submit requests       |   ✅    |  ✅   |   ❌    |  ❌   |
| View own requests     |   ✅    |  ✅   |   ✅    |  ✅   |
| View all requests     |   ❌    |  ❌   |   ❌    |  ✅   |
| View assigned tasks   |   ❌    |  ❌   |   ✅    |  ✅   |
| Update request status |   ❌    |  ❌   |   ✅    |  ✅   |
| Assign officers       |   ❌    |  ❌   |   ❌    |  ✅   |
| Manage users          |   ❌    |  ❌   |   ❌    |  ✅   |
| Manage categories     |   ❌    |  ❌   |   ❌    |  ✅   |
| View reports          |   ❌    |  ❌   |   ❌    |  ✅   |
| Add comments          |   ✅    |  ✅   |   ✅    |  ✅   |

---

## ✨ Features

### For Students & Staff

- 📝 Submit maintenance requests with details and priority
- 📊 Track request status in real-time
- 💬 Add comments and updates to requests
- 📱 Mobile-responsive interface
- 🔐 Secure authentication

### For Maintenance Officers

- 📋 View assigned tasks dashboard
- ✅ Update task status (In Progress, Completed)
- 💬 Communicate with requesters via comments
- 📱 Mobile access for on-site updates

### For Administrators

- 📊 Comprehensive dashboard with statistics
- 👥 User management (view, edit roles)
- 📋 View and manage all requests
- 👷 Assign officers to requests
- 📈 Generate reports and analytics
- ⚙️ System settings and category management

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- PostgreSQL database (or use Render's managed PostgreSQL)

### Clone the Repository

```bash
git clone https://github.com/arhnita/Web_App_Anita_Ssmuel.git
cd Web_App_Anita_Ssmuel
```

### Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
# Edit .env with your database URL and JWT secret

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start development server
npm run dev
```

**Environment Variables (server/.env):**

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-secure-jwt-secret"
NODE_ENV="development"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

### Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start development server
npm run dev
```

### Access the Application

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api/docs

---

## 🌐 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set Root Directory to `client`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = Your backend URL + `/api`
5. Deploy

### Backend (Render)

1. Create new Web Service
2. Connect GitHub repository
3. Configure:
   - Root Directory: `server`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
4. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `FRONTEND_URL`
5. Deploy

### Database (Render PostgreSQL)

1. Create PostgreSQL instance on Render
2. Copy connection string to `DATABASE_URL`
3. Run migrations: `npx prisma migrate deploy`
4. Seed data: `npx prisma db seed`

---

## 📁 Project Structure

```
Web_App_MIT_Anita_Samuel/
├── client/                      # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── admin/           # Admin pages
│   │   │   │   ├── dashboard/
│   │   │   │   ├── requests/
│   │   │   │   ├── users/
│   │   │   │   ├── reports/
│   │   │   │   └── settings/
│   │   │   ├── officer/         # Officer pages
│   │   │   │   └── tasks/
│   │   │   ├── requests/        # Request pages
│   │   │   │   ├── new/
│   │   │   │   └── [id]/
│   │   │   ├── dashboard/       # User dashboard
│   │   │   ├── profile/         # Profile page
│   │   │   ├── login/           # Auth pages
│   │   │   ├── register/
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── page.tsx         # Landing page
│   │   │   └── globals.css      # Global styles
│   │   ├── components/
│   │   │   ├── layout/          # Layout components
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Header.tsx
│   │   │   └── ui/              # UI components
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── Input.tsx
│   │   │       └── ...
│   │   ├── lib/
│   │   │   ├── api.ts           # Axios API client
│   │   │   └── utils.ts         # Utility functions
│   │   ├── store/
│   │   │   └── authStore.ts     # Zustand auth store
│   │   └── types/
│   │       └── index.ts         # TypeScript types
│   ├── .env.production          # Production env vars
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── server/                      # Backend (Express.js)
│   ├── src/
│   │   ├── routes/              # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── request.routes.ts
│   │   │   ├── category.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   └── admin.routes.ts
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.ts          # JWT authentication
│   │   │   └── errorHandler.ts  # Error handling
│   │   ├── utils/
│   │   │   └── prisma.ts        # Prisma client
│   │   └── index.ts             # Entry point
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.ts              # Seed data
│   │   └── migrations/          # DB migrations
│   ├── .env                     # Environment vars
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md                    # This file
```

---

## 📝 License

This project was developed for MIT 8333 Web Application Development course.

## 👩‍💻 Author

**Anita Samuel**

- GitHub: [@arhnita](https://github.com/arhnita)

---

## 🙏 Acknowledgments

- MIT 8333 Course Instructors
- MIVA University
- Open source community for the amazing tools and libraries
