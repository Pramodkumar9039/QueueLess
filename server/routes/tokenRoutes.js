
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const staffMiddleware = require("../middleware/staffMiddleware");

const {
  createToken,
  getMyTokenStatus,
  getMyActiveToken,
  getQueueTokens,
  getCustomerQueueTokens,
  callNextCustomer,
  completeToken,
} = require("../controllers/tokenController");

// Create a token for the logged-in customer.
router.post("/", authMiddleware, createToken);

// Get the logged-in customer's active token in a queue.
router.get(
  "/queue/:queueId/my-active",
  authMiddleware,
  getMyActiveToken
);

// Customer: get public queue token numbers and statuses.
router.get(
  "/queue/:queueId/customer-tokens",
  authMiddleware,
  getCustomerQueueTokens
);

// Staff/admin: get all queue tokens, including customer names.
router.get(
  "/queue/:queueId/tokens",
  authMiddleware,
  staffMiddleware,
  getQueueTokens
);

// Staff: call the next waiting customer.
router.post(
  "/queue/:queueId/call-next",
  authMiddleware,
  staffMiddleware,
  callNextCustomer
);

// Get the logged-in customer's token status.
router.get(
  "/:tokenId/status",
  authMiddleware,
  getMyTokenStatus
);

// Staff: complete a serving token.
router.patch(
  "/:tokenId/complete",
  authMiddleware,
  staffMiddleware,
  completeToken
);

module.exports = router;
