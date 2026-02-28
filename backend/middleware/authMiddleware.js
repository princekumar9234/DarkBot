// ============================================
// Auth Middleware - JWT Verification
// ============================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect API routes
 * Verifies JWT token from cookies or Authorization header
 */
const authMiddleware = async (req, res, next) => {
    try {
        let token;

        // Check cookie first, then Authorization header
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Please log in.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please log in again.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please log in again.'
        });
    }
};

/**
 * Middleware: just load user if exists (useful for optional auth)
 */
const loadUser = async (req, res, next) => {
    try {
        if (req.cookies && req.cookies.token) {
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (user) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        next();
    }
};

module.exports = { authMiddleware, loadUser };
