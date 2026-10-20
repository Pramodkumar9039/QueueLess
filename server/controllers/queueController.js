const mongoose = require("mongoose");
const Queue = require("../models/Queue");
const Service = require("../models/Service");
const Organization = require("../models/Organization");

// Check whether the logged-in user can manage this service
const canManageService = async (service, user) => {
  const organization = await Organization.findOne({
    _id: service.organization,
    isActive: true,
  }).select("owner staff");

  if (!organization) {
    return false;
  }

  // Admins can manage only organizations they own
  if (user.role === "admin") {
    return organization.owner.toString() === user.userId;
  }

  // Staff can manage only organizations they are assigned to
  if (user.role === "staff") {
    return organization.staff.some(
      (staffId) => staffId.toString() === user.userId
    );
  }

  return false;
};

// Get or create today's queue for a service (public)
const getOrCreateQueue = async (req, res) => {
  try {
    const { serviceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        message: "Invalid service ID",
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

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        message: "Invalid service ID",
      });
    }

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

    // Verify organization access before changing the queue
    const authorized = await canManageService(service, req.user);

    if (!authorized) {
      return res.status(403).json({
        message: "You are not authorized to manage this service's queue",
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