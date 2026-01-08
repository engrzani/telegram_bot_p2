const express = require('express');
const router = express.Router();
const { isAuthenticated, hasActiveLicense } = require('../middleware/auth');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Dashboard home
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    
    // Fetch delivery block logs
    const db = require('../database/db');
    const recentLogs = await db.all(
      'SELECT * FROM delivery_block_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100',
      [req.session.user.id]
    );

    // Calculate statistics
    const today = new Date().toISOString().split('T')[0];
    const acceptedToday = recentLogs.filter(log => log.result === 'accepted' && log.timestamp && log.timestamp.includes(today)).length;
    const totalAccepted = recentLogs.filter(log => log.result === 'accepted').length;
    const totalPayout = recentLogs.filter(log => log.result === 'accepted').reduce((sum, log) => sum + (parseFloat(log.payout) || 0), 0);
    const avgPayout = totalAccepted > 0 ? (totalPayout / totalAccepted) : 0;

    // Update session with latest user data
    req.session.user.license_status = user.license_status;

    res.render('dashboard', {
      title: 'Dashboard',
      user: user,
      recentLogs: recentLogs,
      stats: {
        acceptedToday,
        totalAccepted,
        totalPayout,
        avgPayout
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading dashboard',
      error: {}
    });
  }
});

// Activity logs page
router.get('/logs', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    
    // Fetch delivery block logs instead of activity logs
    const db = require('../database/db');
    const logs = await db.all(
      'SELECT * FROM delivery_block_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100',
      [req.session.user.id]
    );
    
    res.render('logs', {
      title: 'Logs & Activity',
      user: user,
      logs: logs
    });
  } catch (error) {
    console.error('Logs error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading logs',
      error: {}
    });
  }
});

// Profile page
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    res.render('profile', {
      title: 'Profile',
      user: user,
      message: req.query.message,
      error: req.query.error
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading profile',
      error: {}
    });
  }
});

// Update profile information
router.post('/profile/update', isAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.session.user.id;

    await User.updateProfile(userId, { full_name: name });

    // Log activity
    await ActivityLog.create(userId, 'profile_update', 'Updated profile information');

    res.redirect('/dashboard/profile?message=Profile updated successfully');
  } catch (error) {
    console.error('Profile update error:', error);
    res.redirect('/dashboard/profile?error=Failed to update profile');
  }
});

// Update bot settings
router.post('/profile/bot-settings', isAuthenticated, async (req, res) => {
  try {
    const { botToken, autoAccept, minBlockValue } = req.body;
    const userId = req.session.user.id;

    await User.updateBotSettings(userId, {
      bot_token: botToken,
      auto_accept: autoAccept === 'on',
      min_block_value: parseFloat(minBlockValue) || 0
    });

    // Log activity
    await ActivityLog.create(userId, 'bot_settings_update', 'Updated bot settings');

    res.redirect('/dashboard/profile?message=Bot settings updated successfully');
  } catch (error) {
    console.error('Bot settings update error:', error);
    res.redirect('/dashboard/profile?error=Failed to update bot settings');
  }
});

// Update notification preferences
router.post('/profile/notifications', isAuthenticated, async (req, res) => {
  try {
    const { emailNotif, telegramNotif } = req.body;
    const userId = req.session.user.id;

    // Update notification preferences in database
    await User.updateNotifications(userId, {
      email_notifications: emailNotif === 'on',
      telegram_notifications: telegramNotif === 'on'
    });

    // Log activity
    await ActivityLog.create(userId, 'notification_update', 'Updated notification preferences');

    res.redirect('/dashboard/profile?message=Notification preferences updated');
  } catch (error) {
    console.error('Notification update error:', error);
    res.redirect('/dashboard/profile?error=Failed to update notifications');
  }
});

// Change password
router.post('/profile/change-password', isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.user.id;

    if (newPassword !== confirmPassword) {
      return res.redirect('/dashboard/profile?error=Passwords do not match');
    }

    const user = await User.findById(userId);
    const bcrypt = require('bcryptjs');
    const validPassword = await bcrypt.compare(currentPassword, user.password);

    if (!validPassword) {
      return res.redirect('/dashboard/profile?error=Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, hashedPassword);

    // Log activity
    await ActivityLog.create(userId, 'password_change', 'Changed account password');

    res.redirect('/dashboard/profile?message=Password updated successfully');
  } catch (error) {
    console.error('Password change error:', error);
    res.redirect('/dashboard/profile?error=Failed to change password');
  }
});

module.exports = router;
