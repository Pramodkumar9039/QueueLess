
const bcrypt = require('bcryptjs');
const User = require('../models/User.js');

const createUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name?.trim() || !email?.trim() || !password) {
            return res.status(400).json({
                message: 'Name, email, and password are required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (password.length < 8) {
            return res.status(400).json({
                message: 'Password must contain at least 8 characters'
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'An account with this email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Never allow the request body to choose the new user's role.
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone?.trim(),
            role: 'customer'
        });

        return res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'An account with this email already exists'
            });
        }

        console.error('Create user error:', error.message);

        return res.status(500).json({
            message: 'Failed to create user'
        });
    }
};

module.exports = { createUser };
