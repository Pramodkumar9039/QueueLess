
const Queue = require("../models/Queue");
const Service = require("../models/Service");

// Get or create today's queue for a service
const getOrCreateQueue = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findOne({
      _id: serviceId,
      isActive: true,
    });

    if (!service) {
      return res.status(404).json({
        message: "Active service not found",
      });
    }

    const date = new Date().toISOString().slice(0, 10);

    let queue = await Queue.findOne({
      service: service._id,
      date,
    });

    if (!queue) {
      try {
        queue = await Queue.create({
          service: service._id,
          date,
        });
      } catch (error) {
        if (error.code !== 11000) {
          throw error;
        }

        queue = await Queue.findOne({
          service: service._id,
          date,
        });
      }
    }

    return res.status(200).json({
      message: "Queue retrieved successfully",
      queue,
    });
  } catch (error) {
    console.error("Get or create queue error:", error);

    return res.status(500).json({
      message: "Unable to retrieve queue",
    });
  }
};

// Pause or resume today's queue
const updateQueueStatus = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { status } = req.body;

    if (!["open", "paused"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either open or paused",
      });
    }

    const service = await Service.findOne({
      _id: serviceId,
      isActive: true,
    });

    if (!service) {
      return res.status(404).json({
        message: "Active service not found",
      });
    }

    const date = new Date().toISOString().slice(0, 10);

    const queue = await Queue.findOne({
      service: service._id,
      date,
    });

    if (!queue) {
      return res.status(404).json({
        message: "Today's queue has not been created yet",
      });
    }

    if (queue.status === "closed") {
      return res.status(400).json({
        message: "A closed queue cannot be paused or resumed",
      });
    }

    queue.status = status;
    await queue.save();

    return res.status(200).json({
      message:
        status === "paused"
          ? "Queue paused successfully"
          : "Queue resumed successfully",
      queue,
    });
  } catch (error) {
    console.error("Update queue status error:", error);

    return res.status(500).json({
      message: "Unable to update queue status",
    });
  }
};

module.exports = {
  getOrCreateQueue,
  updateQueueStatus,
};
