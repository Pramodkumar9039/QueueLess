require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db.js');
const userRoutes = require('./routes/userRoutes.js');
const authRoutes = require('./routes/authRoutes.js');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to QueueLess'
    })
})

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT , () => {
        console.log(`Server is running on PORT No : ${PORT}`);
    })
}).catch((error) => {
    console.error("Server startup failed : ",error.message);
})