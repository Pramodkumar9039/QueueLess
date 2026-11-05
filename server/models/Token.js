
const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    queue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokenNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["waiting", "serving", "completed", "cancelled"],
      default: "waiting",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Unique token number within each queue.
tokenSchema.index(
  { queue: 1, tokenNumber: 1 },
  { unique: true }
);

// One active token per customer across all queues.
tokenSchema.index(
  { customer: 1 },
  {
    unique: true,
    name: "unique_active_token_per_customer",
    partialFilterExpression: {
      status: { $in: ["waiting", "serving"] },
    },
  }
);

// Only one serving token per queue.
tokenSchema.index(
  { queue: 1 },
  {
    unique: true,
    name: "unique_serving_token_per_queue",
    partialFilterExpression: {
      status: "serving",
    },
  }
);

module.exports = mongoose.model("Token", tokenSchema);
