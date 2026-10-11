const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { createToken } = require("../controllers/tokenController");

// Only logged-in users can create tokens
router.post("/", authMiddleware, createToken);

module.exports = router;
