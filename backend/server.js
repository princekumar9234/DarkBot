// ============================================
// DarkBot - Main Server Entry Point
// ============================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const MongoStore = require('connect-mongo').default;

// Import Routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');

// Import Middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable trust proxy so that 'secure: true' cookies work behind a reverse proxy (like Render/Heroku)
app.set('trust proxy', 1);

// ============================================
// Security & Middleware
// ============================================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https://api.openai.com", "https://generativelanguage.googleapis.com"],
        },
    },
}));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL, 'https://darkbot.onrender.com'] // Fallback or use *
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'darkbot_session',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 7 * 24 * 60 * 60, // 7 days
        autoRemove: 'native'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', 
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date(), uptime: process.uptime() });
});

// ============================================
// Routes
// ============================================

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);

// Serve Static Frontend Files (after API routes)
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// Catch-all to serve index.html for React Router
app.get('*', (req, res) => {
    // If request is not an API call, serve React App
    if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
        res.sendFile(path.join(distPath, 'index.html'));
    }
});

// Error Handler
app.use(errorHandler);

// ============================================
// Database Connection & Server Start
// ============================================

const MONGO_URI = process.env.MONGODB_URI;
const MAX_RETRIES = 5;
let retryCount = 0;

// Start HTTP server first (so Render health checks pass)
const server = app.listen(PORT, () => {
    console.log(`🤖 DarkBot is live!`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔗 Mode: ${process.env.NODE_ENV || 'development'}`);
});

// Connect to MongoDB with retry
function connectDB() {
    mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    })
    .then((conn) => {
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        retryCount = 0;
    })
    .catch((err) => {
        retryCount++;
        console.error(`❌ MongoDB Error (attempt ${retryCount}/${MAX_RETRIES}): ${err.message}`);
        if (retryCount < MAX_RETRIES) {
            console.log(`🔄 Retrying in 5 seconds...`);
            setTimeout(connectDB, 5000);
        } else {
            console.error('🔴 Max retries reached. Check your MONGODB_URI and network.');
        }
    });
}

connectDB();

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
});

module.exports = app;
