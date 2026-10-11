const express = require("express");
const router = express.Router();

const { getOrCreateQueue } = require("../controllers/queueController");

// get or create a queue for a service
router.get("/service/:serviceId", getOrCreateQueue);

module.exports = router;
