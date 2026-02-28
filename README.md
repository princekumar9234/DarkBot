# DarkBot - AI Chatbot Platform

A powerful AI chatbot project powered by OpenAI and Google Gemini, refactored into a modern MERN-like stack with a React frontend and Node.js/Express backend.

## 🚀 Key Features

- **Dual AI Engines**: Switch between Google Gemini and OpenAI.
- **Modern UI**: Clean, responsive, glassmorphic design built with React and Tailwind concepts.
- **Multimodal Support**: Send text and attachments (Images, PDFs, Text files).
- **Persistent Memory**: Chat history and sessions managed with MongoDB.
- **Security**: Robust authentication and secure sessions.

## 📁 Project Structure

```bash
root/
├── frontend/         # React + Vite Application
│   ├── src/          # Source files
│   ├── services/     # Axios API services
│   └── components/   # UI Fragments
├── backend/          # Node.js + Express + MongoDB
│   ├── controllers/  # API Logic
│   ├── models/       # Mongoose Schemas
│   └── routes/       # API Endpoints
└── README.md
```

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- OpenAI API Key & Google Gemini API Key

### 2. Environment Configuration

#### Backend (`/backend/.env`)
Create a `.env` file in the `backend/` directory with:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
NODE_ENV=development
```

#### Frontend (`/frontend/.env`)
Create a `.env` file in the `frontend/` directory with:
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Installation

From the root directory:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 4. Running the Project

**Option 1: Concurrent Mode (Recommended)**
From the root directory:
```bash
npm run dev
```

**Option 2: Separate Terminals**
- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm run dev`

## 🛡️ License
ISC - Prince Kumar
