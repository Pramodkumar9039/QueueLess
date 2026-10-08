const User = require('../models/User.js');

const createUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email, and password are required'
            });
        }

        const existingUser = await User.findOne({ email });

        if(existingUser){
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            phone
        });

        res.status(201).json({
            message: "User created successfully",
            user
        })
    }
    catch(error){
        res.status(500).json({
            message: "Failed to create user",
            error: error.message
        });
    }
};

module.exports = {
    createUser
}