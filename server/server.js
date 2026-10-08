require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db.js');
const userRoutes = require('./routes/userRoutes.js');

const app = express();

app.use(express.json());

app.use('/api/users', userRoutes);

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