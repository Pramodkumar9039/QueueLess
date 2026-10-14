
require('dotenv').config();

const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db.js');
const User = require('../models/User.js');

async function createFirstAdmin() {
    const rl = readline.createInterface({ input: stdin, output: stdout });

    try {
        console.log('\n=== QueueLess First Admin Setup ===\n');

        const name = (await rl.question('Admin name: ')).trim();
        const email = (await rl.question('Admin email: '))
            .trim()
            .toLowerCase();
        const password = await rl.question('Admin password (input will be visible): ');

        if (!name || !email || !password) {
            throw new Error('Name, email, and password are required.');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Please enter a valid email address.');
        }

        if (password.length < 8) {
            throw new Error('Password must contain at least 8 characters.');
        }

        await connectDB();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new Error(
                'This email already exists. No account was changed. ' +
                'Choose a new email for the separate admin account.'
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const admin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        console.log('\nAdmin account created successfully!');
        console.log('Name:', admin.name);
        console.log('Email:', admin.email);
        console.log('Role:', admin.role);
        console.log('You can now log in using the existing login page.');
    } catch (error) {
        console.error('\nAdmin setup failed:', error.message);
        process.exitCode = 1;
    } finally {
        rl.close();

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
}

createFirstAdmin();
