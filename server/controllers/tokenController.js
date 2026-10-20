
const mongoose = require("mongoose");
const Token = require("../models/Token");
const Queue = require("../models/Queue");
const Service = require("../models/Service");
const Organization = require("../models/Organization");

// Check whether a staff member or admin can manage a queue.
const canManageQueue = async (queue, user) => {
  const service = await Service.findOne({
    _id: queue.service,
    isActive: true,
  }).select("organization");

  if (!service) {
    return false;
  }

  const organization = await Organization.findOne({
    _id: service.organization,
    isActive: true,
  }).select("owner staff");

  if (!organization) {
    return false;
  }

  if (user.role === "admin") {
    return organization.owner.toString() === user.userId;
  }

  if (user.role === "staff") {
    return organization.staff.some(
      (staffId) => staffId.toString() === user.userId
    );
  }

  return false;
};

// Create a token for the logged-in customer.
const createToken = async (req, res) => {
  try {
    const { queueId } = req.body;
    const customerId = req.user.userId;

    if (!queueId || !mongoose.Types.ObjectId.isValid(queueId)) {
      return res.status(400).json({
        message: "A valid queue ID is required",
      });
    }

    const queue = await Queue.findById(queueId);

    if (!queue) {
      return res.status(404).json({
        message: "Queue not found",
      });
    }

    if (queue.status !== "open") {
      return res.status(400).json({
        message:
          queue.status === "paused"
            ? "This queue is temporarily paused. Please try again later."
            : "This queue is not accepting customers",
      });
    }

    const existingToken = await Token.findOne({
      queue: queue._id,
      customer: customerId,
      status: { $in: ["waiting", "serving"] },
    });

    if (existingToken) {
      return res.status(400).json({
        message: "You already have an active token in this queue",
        token: existingToken,
      });
    }

    const updatedQueue = await Queue.findOneAndUpdate(
      { _id: queue._id, status: "open" },
      { $inc: { lastTokenNumber: 1 } },
      { returnDocument: "after" }
    );

    if (!updatedQueue) {
      return res.status(400).json({
        message:
          "This queue is no longer accepting customers. Please try again later.",
      });
    }

    try {
      const newToken = await Token.create({
        queue: updatedQueue._id,
        customer: customerId,
        tokenNumber: updatedQueue.lastTokenNumber,
      });

      return res.status(201).json({
        message: "Token created successfully",
        token: newToken,
      });
    } catch (error) {
      await Queue.updateOne(
        {
          _id: updatedQueue._id,
          lastTokenNumber: updatedQueue.lastTokenNumber,
        },
        { $inc: { lastTokenNumber: -1 } }
      );

      throw error;
    }
  } catch (error) {
    console.error("Create token error:", error);

    return res.status(500).json({
      message: "Unable to create token",
    });
  }
};

// Get the logged-in customer's active token.
const getMyActiveToken = async (req, res) => {
  try {
    const { queueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(queueId)) {
      return res.status(400).json({ message: "Invalid queue ID" });
    }

    const token = await Token.findOne({
      queue: queueId,
      customer: req.user.userId,
      status: { $in: ["waiting", "serving"] },
    }).sort({ createdAt: -1 });

    if (!token) {
      return res.status(404).json({ message: "No active token found" });
    }

    return res.status(200).json({
      message: "Active token found",
      token,
    });
  } catch (error) {
    console.error("Get active token error:", error);

    return res.status(500).json({
      message: "Unable to retrieve active token",
    });
  }
};

// Get the status of a token belonging to the logged-in customer.
const getMyTokenStatus = async (req, res) => {
  try {
    const { tokenId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tokenId)) {
      return res.status(400).json({ message: "Invalid token ID" });
    }

    const token = await Token.findOne({
      _id: tokenId,
      customer: req.user.userId,
    }).populate({
      path: "queue",
      populate: {
        path: "service",
        select: "name estimatedDuration",
      },
    });

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    if (!token.queue) {
      return res.status(404).json({
        message: "Queue not found for this token",
      });
    }

    const peopleAhead = await Token.countDocuments({
      queue: token.queue._id,
      tokenNumber: { $lt: token.tokenNumber },
      status: { $in: ["waiting", "serving"] },
    });

    const duration = token.queue.service?.estimatedDuration ?? 15;

    return res.status(200).json({
      message: "Token status retrieved successfully",
      token: {
        id: token._id,
        tokenNumber: token.tokenNumber,
        status: token.status,
        joinedAt: token.joinedAt,
      },
      queue: {
        id: token.queue._id,
        date: token.queue.date,
        status: token.queue.status,
      },
      peopleAhead,
      estimatedWaitingMinutes: peopleAhead * duration,
    });
  } catch (error) {
    console.error("Get token status error:", error);

    return res.status(500).json({
      message: "Unable to retrieve token status",
    });
  }
};

// Staff: call the next waiting customer.
const callNextCustomer = async (req, res) => {
  try {
    const { queueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(queueId)) {
      return res.status(400).json({ message: "Invalid queue ID" });
    }

    const queue = await Queue.findById(queueId);

    if (!queue) {
      return res.status(404).json({ message: "Queue not found" });
    }

    if (!(await canManageQueue(queue, req.user))) {
      return res.status(403).json({
        message: "You are not assigned to this organization's queue",
      });
    }

    if (queue.status !== "open") {
      return res.status(400).json({ message: "Queue is not open" });
    }

    const currentToken = await Token.findOne({
      queue: queue._id,
      status: "serving",
    });

    if (currentToken) {
      return res.status(409).json({
        message: "Complete the current token before calling the next customer",
        token: currentToken,
      });
    }

    const nextToken = await Token.findOneAndUpdate(
      { queue: queue._id, status: "waiting" },
      { $set: { status: "serving" } },
      { sort: { tokenNumber: 1 }, returnDocument: "after" }
    );

    if (!nextToken) {
      return res.status(404).json({
        message: "No waiting customers in this queue",
      });
    }

    return res.status(200).json({
      message: "Next customer called successfully",
      token: nextToken,
    });
  } catch (error) {
    console.error("Call next customer error:", error);

    return res.status(500).json({
      message: "Unable to call next customer",
    });
  }
};

// Staff: complete a token only in an assigned organization.
const completeToken = async (req, res) => {
  try {
    const { tokenId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tokenId)) {
      return res.status(400).json({ message: "Invalid token ID" });
    }

    const token = await Token.findById(tokenId);

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    const queue = await Queue.findById(token.queue);

    if (!queue) {
      return res.status(404).json({ message: "Queue not found" });
    }

    if (!(await canManageQueue(queue, req.user))) {
      return res.status(403).json({
        message: "You are not assigned to this organization's queue",
      });
    }

    if (token.status !== "serving") {
      return res.status(400).json({
        message: "Only a currently serving token can be completed",
      });
    }

    token.status = "completed";
    await token.save();

    return res.status(200).json({
      message: "Token completed successfully",
      token,
    });
  } catch (error) {
    console.error("Complete token error:", error);

    return res.status(500).json({
      message: "Unable to complete token",
    });
  }
};

// Staff: view tokens only for assigned organizations.
const getQueueTokens = async (req, res) => {
  try {
    const { queueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(queueId)) {
      return res.status(400).json({ message: "Invalid queue ID" });
    }

    const queue = await Queue.findById(queueId);

    if (!queue) {
      return res.status(404).json({ message: "Queue not found" });
    }

    if (!(await canManageQueue(queue, req.user))) {
      return res.status(403).json({
        message: "You are not assigned to this organization's queue",
      });
    }

    const tokens = await Token.find({ queue: queue._id })
      .populate("customer", "name")
      .select("tokenNumber status joinedAt createdAt customer queue")
      .sort({ tokenNumber: 1 })
      .lean();

    return res.status(200).json({
      message: "Queue tokens fetched successfully",
      tokens,
    });
  } catch (error) {
    console.error("Get queue tokens error:", error);

    return res.status(500).json({
      message: "Unable to fetch queue tokens",
    });
  }
};

module.exports = {
  createToken,
  getMyActiveToken,
  getMyTokenStatus,
  callNextCustomer,
  completeToken,
  getQueueTokens,
};
