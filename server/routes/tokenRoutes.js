
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const staffMiddleware = require("../middleware/staffMiddleware");

const {
  createToken,
  getMyTokenStatus,
  getMyActiveToken,
  getQueueTokens,
  callNextCustomer,
  completeToken,
} = require("../controllers/tokenController");

// Create a token for the logged-in customer
router.post("/", authMiddleware, createToken);

// Get the current customer's active token in a queue
router.get(
  "/queue/:queueId/my-active",
  authMiddleware,
  getMyActiveToken
);

// Get all tokens for a queue
router.get(
  "/queue/:queueId/tokens",
  authMiddleware,
  getQueueTokens
);

// Staff: call the next waiting customer
router.post(
  "/queue/:queueId/call-next",
  authMiddleware,
  staffMiddleware,
  callNextCustomer
);

// Get the logged-in customer's token status
router.get(
  "/:tokenId/status",
  authMiddleware,
  getMyTokenStatus
);

// Staff: complete a serving token
router.patch(
  "/:tokenId/complete",
  authMiddleware,
  staffMiddleware,
  completeToken
);

module.exports = router;
