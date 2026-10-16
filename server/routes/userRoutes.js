
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const staffMiddleware = require('../middleware/staffMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const {
  createUser,
  createStaff,
} = require('../controllers/userController');

// Existing endpoint
router.post('/', authMiddleware, staffMiddleware, createUser);

// Admin-only staff creation and organization assignment
router.post(
  '/staff',
  authMiddleware,
  adminMiddleware,
  createStaff
);

module.exports = router;
