# Quizzy - Full-Stack Quiz Application

A production-ready quiz platform with secure authentication, quiz authoring, participation, and creator-only results visibility.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT bearer tokens

## Features

- User sign up, login, logout
- Authenticated users can create quizzes with:
  - Title, description
  - Multiple questions
  - Multiple choices per question
  - One correct answer per question
- Logged-in users can browse and attempt quizzes
- Instant scoring after submission
- Attempt history stored in database
- Strict access control:
  - Only quiz owner can access participant results and analytics
  - Other users cannot read anyone else's results
- Creator dashboard with quiz analytics
- Optional enhancements included:
  - Public/private quizzes
  - Timer (in seconds)

## Folder Structure

```text
Quizzy/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
      server.js
  frontend/
    src/
      api/
      components/
      context/
      pages/
      App.jsx
      main.jsx
```

## Setup

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 2) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on Vite default port, backend on `http://localhost:5000`.

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Quizzes

- `GET /api/quizzes`
- `POST /api/quizzes`
- `GET /api/quizzes/:id`
- `POST /api/quizzes/:id/submit`
- `GET /api/quizzes/:id/my-attempts`

### Results (owner protected)

- `GET /api/results/dashboard`
- `GET /api/results/quiz/:quizId`

The results endpoints enforce ownership checks server-side before returning data.
# quizzy
