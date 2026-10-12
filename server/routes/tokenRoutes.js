const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { createToken , getMyTokenStatus, callNextCustomer , completeToken } = require("../controllers/tokenController");
const staffMiddleware = require("../middleware/staffMiddleware");

// Only logged-in users can create tokens
router.post("/", authMiddleware, createToken);

//get the logged-in customer's token status
router.get('/:tokenId/status',authMiddleware,getMyTokenStatus);

// Staff: call the next waiting customer 
router.post("/queue/:queueId/call-next",authMiddleware,staffMiddleware,callNextCustomer);


router.patch("/:tokenId/complete", authMiddleware, staffMiddleware , completeToken);

module.exports = router;
