const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Admin panel
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    const users = await User.getAllUsers();
    const recentLogs = await ActivityLog.getAll(20);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      user: user,
      users: users,
      recentLogs: recentLogs
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading admin dashboard',
      error: {}
    });
  }
});

// Update user license status
router.post('/user/:id/license', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { status, expiry } = req.body;

    await User.updateLicenseStatus(userId, status, expiry);

    // Log the action
    await ActivityLog.create({
      user_id: req.session.user.id,
      action: 'update_license',
      details: `Updated license for user ID ${userId} to ${status}`,
      ip_address: req.ip
    });

    res.json({ success: true, message: 'License status updated' });
  } catch (error) {
    console.error('License update error:', error);
    res.status(500).json({ success: false, error: 'Error updating license' });
  }
});

// Get all users (API endpoint)
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json({ success: true, users: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Error fetching users' });
  }
});

// Update user status (new endpoint for admin panel)
router.post('/user/:id/status', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { status, expiry } = req.body;

    await User.updateLicenseStatus(userId, status, expiry);

    // Log the action
    await ActivityLog.create(req.session.user.id, 'admin_update_status', `Updated user ${userId} status to ${status}`);

    res.json({ success: true, message: 'User status updated' });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ success: false, error: 'Error updating user status' });
  }
});

// View user logs
router.get('/user/:id/logs', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(req.session.user.id);
    const targetUser = await User.findById(userId);
    const db = require('../database/db');
    const logs = await db.all(
      'SELECT * FROM delivery_block_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100',
      [userId]
    );

    res.render('logs', {
      title: `Logs for ${targetUser.email}`,
      user: user,
      logs: logs
    });
  } catch (error) {
    console.error('User logs error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading user logs',
      error: {}
    });
  }
});

module.exports = router;
