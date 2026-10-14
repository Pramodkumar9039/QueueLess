const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const staffMiddleware = require("../middleware/staffMiddleware");

const {
  getOrCreateQueue,
  updateQueueStatus,
} = require("../controllers/queueController");

// Get or create a queue for a service
router.get("/service/:serviceId", getOrCreateQueue);

// Pause or resume today's queue — staff only
router.patch(
  "/service/:serviceId/status",
  authMiddleware,
  staffMiddleware,
  updateQueueStatus
);

module.exports = router;
