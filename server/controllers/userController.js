const bcrypt = require('bcryptjs');
const User = require('../models/User.js');
const mongoose = require('mongoose');
const Organization = require('../models/Organization.js');

const createUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name?.trim() || !email?.trim() || !password) {
            return res.status(400).json({
                message: 'Name, email, and password are required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (password.length < 8) {
            return res.status(400).json({
                message: 'Password must contain at least 8 characters'
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'An account with this email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Never allow the request body to choose the new user's role.
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone?.trim(),
            role: 'customer'
        });

        return res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'An account with this email already exists'
            });
        }

        console.error('Create user error:', error.message);

        return res.status(500).json({
            message: 'Failed to create user'
        });
    }
};


const createStaff = async (req, res) => {
  let createdUserId = null;

  try {
    const { name, email, password, phone, organizationId } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password ||
      !organizationId
    ) {
      return res.status(400).json({
        message: 'Name, email, password, and organization ID are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({
        message: 'Invalid organization ID',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must contain at least 8 characters',
      });
    }

    const organization = await Organization.findOne({
        _id: organizationId,
        owner: req.user.userId,
        isActive: true,
    });

    if (!organization) {
      return res.status(404).json({
        message: 'Active organization not found',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const staffUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone?.trim(),
      role: 'staff',
    });

    createdUserId = staffUser._id;

    organization.staff.addToSet(staffUser._id);
    await organization.save();

    return res.status(201).json({
      message: 'Staff account created and assigned successfully',
      user: {
        id: staffUser._id,
        name: staffUser.name,
        email: staffUser.email,
        phone: staffUser.phone,
        role: staffUser.role,
      },
      organization: {
        id: organization._id,
        name: organization.name,
      },
    });
  } catch (error) {
    // Avoid leaving an unassigned staff account if assignment fails.
    if (createdUserId) {
      await User.findByIdAndDelete(createdUserId).catch(() => {});
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'An account with this email already exists',
      });
    }

    console.error('Create staff error:', error.message);

    return res.status(500).json({
      message: 'Failed to create staff account',
    });
  }
};


module.exports = { createUser , createStaff };
