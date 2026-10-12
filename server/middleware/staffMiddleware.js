const staffMiddleware = (req , res , next) => {
    if(!req.user){
        return res.status(401).json({
            message: "Authentication required",
        })
    }

    if(req.user.role !== 'staff' && req.user.role !== 'admin'){
        return res.status(403).json({
            message: "Access denied. Staff only."
        })
    }

    next();
}

module.exports = staffMiddleware;