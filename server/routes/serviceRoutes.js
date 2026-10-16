
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const {
    createService,
    getServicesByOrganization,
} = require('../controllers/serviceController');

// Anyone can view services for an organization.
router.get(
    '/organization/:organizationId',
    getServicesByOrganization
);

// Only admins can create services.
router.post(
    '/',
    authMiddleware,
    adminMiddleware,
    createService
);

module.exports = router;
