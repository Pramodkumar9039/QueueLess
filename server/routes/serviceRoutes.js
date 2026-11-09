
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
    mongoIdParam,
    serviceValidation
} = require('../middleware/validation');

const {
    createService,
    getServicesByOrganization,
} = require('../controllers/serviceController');

// Anyone can view services for an organization.
router.get(
    '/organization/:organizationId',
    mongoIdParam('organizationId'),
    getServicesByOrganization
);

// Only admins can create services.
router.post(
    '/',
    authMiddleware,
    adminMiddleware,
    serviceValidation,
    createService
);

module.exports = router;
