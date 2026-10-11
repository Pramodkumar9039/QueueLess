const Queue = require('../models/Queue');
const Service = require('../models/Service');

// get or create today's queue for a service
const getOrCreateQueue = async (req , res) => {
    try{
        const {serviceId} = req.params;

        const service = await Service.findOne({
            _id: serviceId,
            isActive: true,
        })

        if(!service){
            return res.status(404).json({
                message: "Active service not found",
            })
        }

        // dinanka YYY-MM-DD format alle irbeku...
        const date = new Date().toISOString().slice(0 , 10);

        let queue = await Queue.findOne({
            service: service._id,
            date,
        });

        if(!queue){
            try{
                queue = await Queue.create({
                    service: service._id,
                    date,
                })
            }
            catch(error){
                // another request may have created the queue simultaneously
                if(error.code != 11000){
                    throw error;
                }

                queue = await Queue.findOne({
                    service: service._id,
                    date,
                });
            }
        }

        return res.status(200).json({
            message: 'queue retrieved successfully',
            queue,
        });
    }
    catch(error){
        console.error("get or create queue error:",error);

        return res.status(500).json({
            message: "Unable to retrieve queue",
        })
    }
}

module.exports = {getOrCreateQueue}