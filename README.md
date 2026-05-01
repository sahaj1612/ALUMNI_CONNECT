# SDMCET AlumniConnect

SDMCET AlumniConnect is a MERN-style web application for connecting SDMCET students and alumni through opportunities, events, profiles, registrations, applications, and institutional information pages.

## Project Structure

```text
ALUMNI_CONNECT/
├── frontend/   # React + Vite user interface
└── backend/    # Node.js + Express + MongoDB API
```

## Features

- Public homepage for SDMCET AlumniConnect with animated hero sections and responsive navigation.
- Public pages for About SDMCET, Alumni Association, Events, and Support.
- Student login with USN, email, and password.
- Alumni login with email and password.
- Protected student portal and alumni portal.
- Student dashboard for viewing jobs, events, notifications, and profile details.
- Alumni dashboard for managing profile data and posting jobs or events.
- Job and event detail pages.
- Event registration workflow.
- Job application workflow with resume upload support.
- Profile photo upload support for students and alumni.
- JWT-based authentication and protected API routes.
- MongoDB data models for students, alumni, jobs, events, registrations, applications, and notifications.
- CORS configuration for local frontend/backend development.
- Responsive UI with light/dark theme support.

## Tech Stack

### Frontend

- React 19
- React Router
- Vite
- CSS

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Multer file uploads
- Morgan request logging
- CORS

## Prerequisites

- Node.js
- npm
- MongoDB running locally or a MongoDB connection string

## Setup

Clone the repository:

```bash
git clone https://github.com/sahaj1612/ALUMNI_CONNECT.git
cd ALUMNI_CONNECT
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/alumniConnectDB
JWT_SECRET=change-me-in-production
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173,http://127.0.0.1:5173
```

Create `frontend/.env` from `frontend/.env.example` if you need to override the API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

## Run Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`

## Build Frontend

```bash
cd frontend
npm run build
```

## Start Backend

```bash
cd backend
npm start
```

## Default Login Accounts

### Student

- USN: `2SD24CS075`
- Email: `sahaj.ssh16@gmail.com`
- Password: `1234`

### Alumni

- Email: `sahaj.ssh16@gmail.com`
- Password: `1234`

## Important Routes

### Public Pages

- `/` - Homepage
- `/about` - About SDMCET
- `/alumni` - Alumni Association information
- `/events` - SDMCET events information
- `/support` - Support and contact information

### Protected Pages

- `/student` - Student portal
- `/alumni-portal` - Alumni portal
- `/details/:type/:id` - Job or event details

## Backend Notes

- Main server file: `backend/server.js`
- App configuration: `backend/src/app.js`
- API routes are mounted under `/api`.
- Uploaded files are stored under `backend/uploads`.
- Runtime uploads are ignored by Git to avoid committing user files.

## API Overview

- `/api/health` - Backend health check
- `/api/auth` - Student and alumni authentication
- `/api/student` - Student portal, profile, jobs, events, applications, and notifications
- `/api/alumni` - Alumni portal, profile, job/event management, applications, and notifications
- `/api/details` - Shared job and event detail lookup

## Notes

- Keep `JWT_SECRET` private in production.
- Do not commit `.env` files or uploaded user documents.
- Make sure MongoDB is running before starting the backend.
