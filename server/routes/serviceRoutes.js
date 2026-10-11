const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const {
    createService,
    getServicesByOrganization,
} = require('../controllers/serviceController');

// get services for a specific organization 
router.get("/organization/:organizationId",getServicesByOrganization);

// Only authenticated users can create services 
router.post('/',authMiddleware,createService);

module.exports = router;