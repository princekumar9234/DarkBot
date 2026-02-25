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
const MongoStore = require('connect-mongo');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const viewRoutes = require('./routes/viewRoutes');

// Import Middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use(cors());
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
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

// ============================================
// View Engine & Static Files
// ============================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date(), uptime: process.uptime() });
});

// ============================================
// Routes
// ============================================
app.use('/', viewRoutes);
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/user', userRoutes);

// ============================================
// Error Handler
// ============================================
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
