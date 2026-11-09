
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const staffMiddleware = require('../middleware/staffMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  assignmentValidation,
  staffValidation,
  userValidation,
} = require('../middleware/validation');

const {
  createUser,
  createStaff,
  assignExistingStaff,
  getAllStaff,
} = require('../controllers/userController');

router.post('/', authMiddleware, staffMiddleware, userValidation, createUser);

router.post(
  '/staff',
  authMiddleware,
  adminMiddleware,
  staffValidation,
  createStaff
);

// Assign an existing staff account to an organization.
router.patch(
  '/staff/assign',
  authMiddleware,
  adminMiddleware,
  assignmentValidation,
  assignExistingStaff
);

// Get all staff members (for admin view).
router.get(
  "/staff",
  authMiddleware,
  adminMiddleware,
  getAllStaff
);

module.exports = router;
