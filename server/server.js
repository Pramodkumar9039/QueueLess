require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db.js');
const userRoutes = require('./routes/userRoutes.js');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const organizationRoutes = require('./routes/organizationRoutes')
const serviceRoutes = require('./routes/serviceRoutes');
const queueRoutes = require("./routes/queueRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const {
    errorHandler,
    notFoundHandler
} = require("./middleware/errorHandler");

const app = express();

const trustProxyHops = process.env.TRUST_PROXY_HOPS
    ? Number(process.env.TRUST_PROXY_HOPS)
    : 0;

if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) {
    throw new Error('TRUST_PROXY_HOPS must be a non-negative integer');
}

app.set('trust proxy', trustProxyHops);

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/tokens", tokenRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to QueueLess'
    })
})

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT , () => {
        console.log(`Server is running on PORT No : ${PORT}`);
    })
}).catch((error) => {
    console.error("Server startup failed : ",error.message);
})