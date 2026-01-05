const User = require('../models/User');
const nodemailer = require('nodemailer');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin, Manager)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('assignedWarehouse', 'name code')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin, Manager)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('assignedWarehouse', 'name code');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, status, assignedWarehouse } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      status,
      assignedWarehouse: assignedWarehouse || undefined
    });

    // Populate assignedWarehouse before sending response
    await user.populate('assignedWarehouse', 'name code');

    // Send welcome email with credentials
    try {
      // Configure email transporter
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      // Role display names
      const roleNames = {
        'ADMIN': 'Administrator',
        'INVENTORY_MANAGER': 'Inventory Manager',
        'WAREHOUSE_STAFF': 'Warehouse Staff',
        'WAREHOUSE_MANAGER': 'Warehouse Manager'
      };

      const warehouseInfo = user.assignedWarehouse 
        ? `\nAssigned Warehouse: ${user.assignedWarehouse.name} (${user.assignedWarehouse.code})`
        : '';

      // Email content
      const mailOptions = {
        from: `"IMRAS System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to IMRAS - Your Account Has Been Created',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to IMRAS!</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your account has been successfully created in the IMRAS (Inventory Management and Reordering Automation System).</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">Your Account Details:</h3>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0;"><strong>Temporary Password:</strong> ${password}</p>
              <p style="margin: 10px 0;"><strong>Role:</strong> ${roleNames[role] || role}${warehouseInfo}</p>
            </div>

            <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <p style="margin: 0;"><strong>⚠️ Important Security Notice:</strong></p>
              <p style="margin: 10px 0 0 0;">Please change your password after your first login for security purposes.</p>
            </div>

            <p>You can log in to the system at: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="color: #2563eb;">${process.env.FRONTEND_URL || 'http://localhost:3000'}/login</a></p>

            <p>If you have any questions or need assistance, please contact your system administrator.</p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">This is an automated message from IMRAS. Please do not reply to this email.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail user creation if email fails
    }

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update user fields
    Object.assign(user, updateData);

    // Update password if provided
    if (password) {
      user.password = password;
    }

    await user.save();

    // Populate assignedWarehouse before sending response
    await user.populate('assignedWarehouse', 'name code');

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
