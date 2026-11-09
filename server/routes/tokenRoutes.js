
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const staffMiddleware = require("../middleware/staffMiddleware");
const {
  mongoIdParam,
  queueIdBodyValidation,
} = require("../middleware/validation");

const {
  createToken,
  getMyTokenStatus,
  getMyActiveToken,
  getMyCurrentActiveToken,
  getQueueTokens,
  getCustomerQueueTokens,
  callNextCustomer,
  completeToken,
} = require("../controllers/tokenController");

// Create a token for the logged-in customer.
router.post("/", authMiddleware, queueIdBodyValidation, createToken);

// Get the logged-in customer's active token across all queues.
router.get(
  "/my-active",
  authMiddleware,
  getMyCurrentActiveToken
);

// Get the logged-in customer's active token in a specific queue.
router.get(
  "/queue/:queueId/my-active",
  authMiddleware,
  mongoIdParam("queueId"),
  getMyActiveToken
);

// Customer: get public queue token numbers and statuses.
router.get(
  "/queue/:queueId/customer-tokens",
  authMiddleware,
  mongoIdParam("queueId"),
  getCustomerQueueTokens
);

// Staff/admin: get all queue tokens, including customer names.
router.get(
  "/queue/:queueId/tokens",
  authMiddleware,
  staffMiddleware,
  mongoIdParam("queueId"),
  getQueueTokens
);

// Staff: call the next waiting customer.
router.post(
  "/queue/:queueId/call-next",
  authMiddleware,
  staffMiddleware,
  mongoIdParam("queueId"),
  callNextCustomer
);

// Get the logged-in customer's token status.
router.get(
  "/:tokenId/status",
  authMiddleware,
  mongoIdParam("tokenId"),
  getMyTokenStatus
);

// Staff: complete a serving token.
router.patch(
  "/:tokenId/complete",
  authMiddleware,
  staffMiddleware,
  mongoIdParam("tokenId"),
  completeToken
);

module.exports = router;
