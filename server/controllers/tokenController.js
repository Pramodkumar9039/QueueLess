const mongoose = require('mongoose')
const Token = require('../models/Token')
const Queue = require('../models/Queue')

const createToken = async (req , res) => {
    try{
        const{queueId} = req.body;
        console.log("Received queueId:", queueId);
        const customerId = req.user.userId;

        if(!queueId || !mongoose.Types.ObjectId.isValid(queueId)){
            return res.status(400).json({
                message: "A valid queue ID is required",
            })
        }

        // Find the queue
        const queue = await Queue.findById(queueId);
            console.log("Queue found:", queue);
        if(!queue){
            return res.status(404).json({
            message: "Queue not found",
        });
        }

        if(queue.status !== "open"){
            return res.status(400).json({
                message: "This queue is not accepting customers",
            });
        }

        // prevent duplicate active tokens for the same customer
        const existingToken = await Token.findOne({
            queue:queue._id,
            customer:customerId,
            status: {$in:["waiting","serving"]},
        });

        if(existingToken){
            return res.status(400).json({
                message: "You already have an active token in this queue",
                token: existingToken,
            })
        }

        // automatically increament the queue's token counter 
        const updatedQueue = await Queue.findOneAndUpdate(
            { _id: queue._id, status: "open" },
            { $inc: { lastTokenNumber: 1 } },
            { new: true }
        );

        if(!updatedQueue){
            return res.status(400).json({
                message: "this queue is no longer accepting customers",
            })
        }

        try{
            const token = await Token.create({
                queue:updatedQueue._id,
                customer:customerId,
                tokenNumber:updatedQueue.lastTokenNumber,
            })

            return res.status(201).json({
                message:"Token created successfully",
                token,
            })
        }
        catch(error){
            // avoid leaving the counter advanced if token creation fails 
            await Queue.updateOne({
                _id:updatedQueue._id,
                lastTokenNumber: updatedQueue.lastTokenNumber,
            },{
                $inc: { lastTokenNumber: -1}
            }
        )
        throw error;
        }
    }
    catch(error){
        console.error("Created token error : ",error);

        return res.status(500).json({
            message: "Unable to create token",
        })
    }
}

module.exports = {createToken}