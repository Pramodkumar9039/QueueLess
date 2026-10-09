const express = require('express');
const User = require('../models/User.js');

const {
    loginUser,
    registerUser
} = require('../controllers/authController.js');

const authMiddleware = require('../middleware/authmiddleware.js');

const router = express.Router();

router.post('/register',registerUser);
router.post('/login',loginUser);

// A protected endpoint to test authentication 
router.get('/me',authMiddleware, async (req , res) => {
    const User = require('../models/User.js');

    const user = await User.findById(req.user.userId).select('-password');

    if(!user){
        return res.status(404).json({
            message: "User Not Found"
        })
    }

    return res.status(200).json({user});
})

module.exports = router;
