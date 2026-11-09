const mongoose = require('mongoose');

const transactionSupportError =
    'MongoDB transaction support is required. Configure MONGO_URI for a replica set or sharded cluster.';

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);

        const topology = await mongoose.connection.db.admin().command({
            hello: 1
        });

        if (!topology.setName && topology.msg !== 'isdbgrid') {
            throw new Error(transactionSupportError);
        }

        console.log("MongoDB connected successfully");
    }
    catch(error){
        console.error("MongoDB Connection Failed : ",error.message);
        await mongoose.disconnect();
        throw error;
    }
}

module.exports = connectDB