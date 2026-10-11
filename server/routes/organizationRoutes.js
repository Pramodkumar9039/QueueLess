const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
    createOrganization,
    getOrganizations,
} = require('../controllers/organizationController');


//Anyone can view active organizations
router.get('/',getOrganizations);

// Only logged-in users can create organizations
router.post("/", authMiddleware, createOrganization);

module.exports = router;