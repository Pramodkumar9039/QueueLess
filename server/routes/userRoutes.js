
const express = require('express');

const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const staffMiddleware = require('../middleware/staffMiddleware');

const { createUser } = require('../controllers/userController');

// Only authenticated staff/admin can access this endpoint.
// We will add organization-level authorization before using it
// for staff invitations.
router.post('/', authMiddleware, staffMiddleware, createUser);

module.exports = router;
