
const Organization = require('../models/Organization.js');

// Create a new organization
const createOrganization = async (req, res) => {
  try {
    const { name, type, address, description } = req.body;

    if (!name || !type || !address) {
      return res.status(400).json({
        message: 'Name, type and address are required',
      });
    }

    const organization = await Organization.create({
      name,
      type,
      address,
      description,
      owner: req.user.userId,
    });

    return res.status(201).json({
      message: 'Organization created successfully',
      organization,
    });
  } catch (error) {
    console.error('Create organization error:', error);

    return res.status(500).json({
      message: 'Unable to create organization',
    });
  }
};

// Public: get all active organizations
const getOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find({
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: organizations.length,
      organizations,
    });
  } catch (error) {
    console.error('Get organizations error:', error);

    return res.status(500).json({
      message: 'Unable to fetch organizations',
    });
  }
};

// Private: get organizations the logged-in staff/admin can manage
const getAssignedOrganizations = async (req, res) => {
  try {
    let filter;

    if (req.user.role === 'admin') {
      filter = {
        owner: req.user.userId,
        isActive: true,
      };
    } else if (req.user.role === 'staff') {
      filter = {
        staff: req.user.userId,
        isActive: true,
      };
    } else {
      return res.status(403).json({
        message: 'Only staff and admins can access assigned organizations',
      });
    }

    const organizations = await Organization.find(filter)
      .select('name type address description owner staff isActive')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: organizations.length,
      organizations,
    });
  } catch (error) {
    console.error('Get assigned organizations error:', error);

    return res.status(500).json({
      message: 'Unable to fetch assigned organizations',
    });
  }
};

module.exports = {
  createOrganization,
  getOrganizations,
  getAssignedOrganizations,
};
