require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db.js');
const userRoutes = require('./routes/userRoutes.js');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const organizationRoutes = require('./routes/organizationRoutes')
const serviceRoutes = require('./routes/serviceRoutes');
const queueRoutes = require("./routes/queueRoutes");

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/queues", queueRoutes);

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