const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication token required"
        });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    let decoded;

    try {
        if (!token) {
            throw new Error("Missing token");
        }

        decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        if (
            typeof decoded !== "object" ||
            !decoded ||
            typeof decoded.userId !== "string"
        ) {
            throw new Error("Invalid token claims");
        }
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }

    try {
        const user = await User.findById(decoded.userId)
            .select("_id role isActive")
            .lean();

        if (!user || user.isActive === false) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        req.user = {
            userId: user._id.toString(),
            role: user.role
        };

        next();
    } catch (error) {
        console.error("Authentication lookup error:", error.message);
        return res.status(500).json({
            message: "Unable to authenticate user"
        })
    }
};

module.exports = authMiddleware;