require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db')

const app = express();

app.use(express.json());

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