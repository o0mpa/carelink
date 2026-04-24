import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const authMiddleware = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            //extracting token from authorization: Bearer <token>
            const authHeader = req.headers["authorization"];
            const token = authHeader && authHeader.split(' ')[1];
            if (!token) return res.status(401).json({message: 'No Token Provided'});
            //checking blacklisted log out tokens
            const [rows] = await db.promise().query(
                `SELECT 1 FROM blacklisted_tokens WHERE token = ?`, [token]
            );
            if (rows.length > 0) return res.status(401).json({message: 'Token Is Blacklisted'});
            //validate JWT signature and expiry
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            //role-based access control
            if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
                return res.status(403).json({message: 'Access Denied: Insufficient Permissions'});
            }
            //attach user and token to request for downstream use
            req.user = decoded;
            req.token = token;
        } catch (error) {
            //catch DB errors and jwt.verify failures (expired/invalid signature)
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({message: 'Token Expired - Please Sign In Again.'});
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({message: 'Invalid Token'});
            }
            return res.status(500).json({ error: error.message });
        }
    };
};