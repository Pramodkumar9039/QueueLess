const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

//Register a new User 
const registerUser = async (req , res) => {
    try{
        const {name , email , password , phone} = req.body;

        //1. Validate required fields 
        if(!name?.trim() || !email?.trim() || !password){
            return res.status(400).json({
                message: "Name , email and password are required"
            });
        }

        //2. Basic input validation 
        const normalizedEmail = email.trim().toLowerCase();

        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)){
            return res.status(400).json({
                message: "Please provide a valid email"
            });
        }

        if(password.length < 8){
            return res.status(400).json({
                message: "Password must contain atleast 8 charectors"
            });
        }

        //3. check whether the user already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        })

        if(existingUser){
            return res.status(409).json({
                message: "An account with this email already exists"
            })
        }

        //4. Hash the password
        const hashedPassword = await bcrypt.hash(password , 12);

        //5. Create the User
        // Never accept the role from the public registration request.
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone?.trim(),
            role: "customer"
        })

        //6. send only safe User fields
        return res.status(201).json({
            message: "Registration Successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        })
    }
    catch(error){
        //Handle duplicate-email races as well 
        if(error.code == 11000){
            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }

        console.error("Registration error: ",error.message);

        return res.status(500).json({
            message: "Unable to register user"
        })
    }
};

// log in an existing user
const loginUser = async (req , res) => {
    try{
        const {email , password} = req.body;
        
        //1. validate input 
        if(!email?.trim() || !password){
            return res.status(400).json({
                message: "Email and password are required"
            })
        }

        const normalizedEmail = email.trim().toLowerCase();

        //2. find the user
        const user = await User.findOne({
            email: normalizedEmail
        })

        // Use the same error for an unknown email and wrong password
        if(!user){
            return res.status(401).json({
                message: "Invalid email or password"
            })
        }

        //3. compare entered password with stored hash
        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if(!passwordMatches){
            return res.status(401).json({
                message: "Invalid email or password"
            })
        }

        //4. Create a signed JWT
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "24h"
            }
        );

        //5. Return the token and safe user details 
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        })
    }
    catch(error){
        console.error("Login error: ",error.message);

        return res.status(500).json({
            message: "Unable to log in"
        })
    }
};

module.exports = {
    registerUser,
    loginUser
}