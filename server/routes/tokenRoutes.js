const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { createToken , getMyTokenStatus } = require("../controllers/tokenController");

// Only logged-in users can create tokens
router.post("/", authMiddleware, createToken);

//get the logged-in customer's token status
router.get('/:tokenId/status',authMiddleware,getMyTokenStatus);

module.exports = router;
