const jwt = require('jsonwebtoken');

const authMiddleware = (req , res , next) => {
    try{
        //Read the Authorization header
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({
                message: "Authentication token required"
            });
        }

        //Extract the token 
        const token = authHeader.split(" ")[1];

        //Verify signature and expiration 
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Attach verified information to the request 
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        }

        next();
    }
    catch(error){
        return res.status(401).json({
            message: "Invalid or expired token"
        })
    }
};

module.exports = authMiddleware;