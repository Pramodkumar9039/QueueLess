
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const {
    createOrganization,
    getOrganizations
} = require('../controllers/organizationController');

// Anyone can view active organizations.
router.get('/', getOrganizations);

// Only admins can create organizations.
router.post('/', authMiddleware, adminMiddleware, createOrganization);

module.exports = router;
