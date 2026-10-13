
const mongoose = require("mongoose");
const Token = require("../models/Token");
const Queue = require("../models/Queue");

// Create a new token for the logged-in customer
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
        message: "This queue is not accepting customers",
      });
    }

    // Prevent duplicate active tokens for this customer
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

    // Increment the queue's token counter
    const updatedQueue = await Queue.findOneAndUpdate(
      { _id: queue._id, status: "open" },
      { $inc: { lastTokenNumber: 1 } },
      { returnDocument: "after" }
    );

    if (!updatedQueue) {
      return res.status(400).json({
        message: "This queue is no longer accepting customers",
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
      // Roll back the counter if token creation fails
      await Queue.updateOne(
        {
          _id: updatedQueue._id,
          lastTokenNumber: updatedQueue.lastTokenNumber,
        },
        {
          $inc: { lastTokenNumber: -1 },
        }
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

// Get an existing active token for this customer and queue
const getMyActiveToken = async (req, res) => {
  try {
    const { queueId } = req.params;
    const customerId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(queueId)) {
      return res.status(400).json({
        message: "Invalid queue ID",
      });
    }

    const existingToken = await Token.findOne({
      queue: queueId,
      customer: customerId,
      status: { $in: ["waiting", "serving"] },
    }).sort({ createdAt: -1 });

    if (!existingToken) {
      return res.status(404).json({
        message: "No active token found",
      });
    }

    return res.status(200).json({
      message: "Active token found",
      token: existingToken,
    });
  } catch (error) {
    console.error("Get active token error:", error);

    return res.status(500).json({
      message: "Unable to retrieve active token",
    });
  }
};

// Get the status of a token belonging to the logged-in customer
const getMyTokenStatus = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const customerId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(tokenId)) {
      return res.status(400).json({
        message: "Invalid token ID",
      });
    }

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

    if (!token) {
      return res.status(404).json({
        message: "Token not found",
      });
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
    const estimatedWaitingMinutes = peopleAhead * duration;

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
      estimatedWaitingMinutes,
    });
  } catch (error) {
    console.error("Get token status error:", error);

    return res.status(500).json({
      message: "Unable to retrieve token status",
    });
  }
};

// Staff: call the next waiting customer
const callNextCustomer = async (req, res) => {
  try {
    const { queueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(queueId)) {
      return res.status(400).json({
        message: "Invalid queue ID",
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
        message: "Queue is not open",
      });
    }

    const currentToken = await Token.findOne({
      queue: queue._id,
      status: "serving",
    });

    if (currentToken) {
      return res.status(409).json({
        message:
          "Complete the current token before calling the next customer",
        token: currentToken,
      });
    }

    const nextToken = await Token.findOneAndUpdate(
      {
        queue: queue._id,
        status: "waiting",
      },
      {
        $set: { status: "serving" },
      },
      {
        sort: { tokenNumber: 1 },
        returnDocument: "after",
      }
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

// Staff: complete the currently serving token
const completeToken = async (req, res) => {
  try {
    const { tokenId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tokenId)) {
      return res.status(400).json({
        message: "Invalid token ID",
      });
    }

    const token = await Token.findOneAndUpdate(
      {
        _id: tokenId,
        status: "serving",
      },
      {
        $set: { status: "completed" },
      },
      {
        returnDocument: "after",
      }
    );

    if (!token) {
      return res.status(404).json({
        message: "Serving token not found",
      });
    }

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


const getQueueTokens = async (req, res) => {
  try {
    const { queueId } = req.params;

    const tokens = await Token.find({ queue: queueId })
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
