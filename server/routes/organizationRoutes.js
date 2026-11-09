
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const staffMiddleware = require('../middleware/staffMiddleware');
const { organizationValidation } = require('../middleware/validation');

const {
  createOrganization,
  getOrganizations,
  getAssignedOrganizations,
} = require('../controllers/organizationController');

// Public: browse active organizations
router.get('/', getOrganizations);

// Private: organizations the logged-in staff/admin can manage
router.get(
  '/assigned',
  authMiddleware,
  staffMiddleware,
  getAssignedOrganizations
);

// Admin only: create organizations
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  organizationValidation,
  createOrganization
);

module.exports = router;
