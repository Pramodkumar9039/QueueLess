const mongoose = require('mongoose')
const Token = require('../models/Token')
const Queue = require('../models/Queue')

const createToken = async (req , res) => {
    try{
        const{queueId} = req.body;
        const customerId = req.user.userId;

        if(!queueId || !mongoose.Types.ObjectId.isValid(queueId)){
            return res.status(400).json({
                message: "A valid queue ID is required",
            })
        }

        // Find the queue
        const queue = await Queue.findById(queueId);
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
            { returnDocument: "after" }
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

const getMyTokenStatus = async (req , res) => {
    try{
        const{tokenId} = req.params;
        const customerId = req.user.userId;

        //Find a token belonging to the logged-in customer 
        const token = await Token.findOne({
            _id: tokenId,
            customer: customerId,
        }).populate({
            path: "queue",
            populate: {
                path: "service",
                select: "name estimatedDuration",
            },
        });

        if(!token){
            return res.status(404).json({
                message: "Token not found",
            })
        }

        if(!token.queue){
            return res.status(404).json({
                message:"Queue not found for this token",
            })
        }

        //count waiting or serving tokens ahead of this customer
        const peopleAhead = await Token.countDocuments({
            queue: token.queue._id,
            tokenNumber: { $lt : token.tokenNumber},
            status: { $in : ["waiting" , 'serving']}
        })

        const duration = token.queue.service?.estimatedDuration ?? 15;
        const estimatedWaitingMinutes = peopleAhead * duration;

        return res.status(200).json({
            message: "Token status retrieved successfully",
            token:{
                id: token._id,
                tokenNumber: token.tokenNumber,
                status: token.status,
                joinedAt: token.joinedAt,
            },

            queue:{
                id: token.queue._id,
                date: token.queue.date,
                status: token.queue.status,
            },
            peopleAhead,
            estimatedWaitingMinutes
        })
    }
    catch(error){
        console.error("Get token status error: ",error);

        return res.status(500).json({
            message: "Unable to retrieve token status",
        })
    }
}

const callNextCustomer = async (req , res) =>{
    try{
        const {queueId} = req.params;

        if(!mongoose.Types.ObjectId.isValid(queueId)){
            return res.status(400).json({
                message: "Invalid queue ID",
            })
        }

        const queue = await Queue.findById(queueId);

        if(!queue){
            return res.status(404).json({
                message: "Queue not found",
            })
        }

        if(queue.status !== 'open'){
            return res.status(400).json({
                message: "Queue is not open",
            })
        }

        // only call the next customer if nobody is currently being served 
        const currentToken = await Token.findOne({
            queue: queue._id,
            status: "serving",
        })

        if(currentToken){
            return res.status(409).json({
                message: "Complete the current token before calling the next customer",
                token: currentToken,
            })
        }

        // find the earliest waiting token
        const nextToken = await Token.findOneAndUpdate({
            queue:queue._id,
            status: "waiting",
        },
        {
            $set: {status: "serving"},
        },
        {
            sort: {tokenNumber: 1},
            returnDocument:"after",
        }
    );

    if(!nextToken){
        return res.status(404).json({
            message: "No waiting customers in this queue",
        })
    }

    return res.status(200).json({
        message: "Next customer called successfully",
        token: nextToken,
    });
    }catch(error){
        console.error("Call next customer error:",error);

        return res.status(500).json({
            message: "Unable to call next customer",
        })
    }
}

const completeToken = async (req , res) => {
    try{
        const {tokenId} = req.params;

        if(!mongoose.Types.ObjectId.isValid(tokenId)){
            return res.status(400).json({
                message:"Invalid token ID",
            })
        }

        // Only complete a token that is currently being served 
        const token = await Token.findOneAndUpdate(
            {
                _id:tokenId,
                status:"serving",
            },
            {
                $set: {status: "completed"},
            },
            {
                returnDocument: "after",
            }
        );

        if(!token){
            return res.status(404).json({
                message:"Serving token not found",
            })
        }

        return res.status(200).json({
            message:"Token completed successfully",
            token,
        })
    }
    catch(error){
        console.error("Complete token error:",error);

        return res.status(500).json({
            message: "Unable to complete token",
        })
    }
}

module.exports = { createToken, getMyTokenStatus , callNextCustomer , completeToken};