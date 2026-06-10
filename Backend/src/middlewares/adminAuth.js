import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import userModel from '../model/user.model.js';

async function adminAuth(req, res, next) {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized. Please log in again.',
        });
    }

    try {
        const decodedToken = jwt.verify(token, config.JWT_SECRET);

        if (!decodedToken.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please log in again.',
            });
        }

        const user = await userModel.findById(decodedToken.id).select('role');

        if (!user || (user.role || 'faculty') !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required.',
            });
        }

        req.userId = decodedToken.id;
        req.userRole = user.role;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: 'Session expired. Please log in again.',
        });
    }
}

export default adminAuth;
