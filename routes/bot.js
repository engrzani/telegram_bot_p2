const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const User = require('../models/User');
const db = require('../database/db');

// Get bot license status
router.get('/license-status/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ active: false, message: 'User not found' });
    }
    
    // Check if license is active
    const isActive = user.license_status === 'active';
    
    // Check expiry date if exists
    let isExpired = false;
    if (user.license_expiry) {
      const expiryDate = new Date(user.license_expiry);
      const now = new Date();
      isExpired = expiryDate < now;
    }
    
    const active = isActive && !isExpired;
    
    res.json({
      active: active,
      status: user.license_status,
      expiry: user.license_expiry,
      message: active ? 'License active' : 'License inactive or expired'
    });
    
  } catch (error) {
    console.error('License status check error:', error);
    res.status(500).json({ active: false, error: 'Server error' });
  }
});

// Get user bot configuration
router.get('/config/:userId', isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Only allow users to access their own config (or admin)
    if (req.session.user.id !== userId && req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return bot configuration
    res.json({
      user_id: user.id,
      auto_accept: user.auto_accept || false,
      min_block_value: user.min_block_value || 0,
      bot_token: user.bot_token || '',
      email_notifications: user.email_notifications || false,
      telegram_notifications: user.telegram_notifications || false
    });
    
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bot log endpoint
router.post('/log', async (req, res) => {
  try {
    const { user_id, action, details, result, timestamp, block_id, pickup_location, delivery_location, payout } = req.body;
    
    // If it's a delivery block log
    if (block_id) {
      await db.run(
        `INSERT INTO delivery_block_logs (user_id, block_id, pickup_location, delivery_location, payout, result, timestamp) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user_id, block_id, pickup_location, delivery_location, payout, result, timestamp]
      );
    }
    
    // Also log as activity
    await db.run(
      `INSERT INTO activity_logs (user_id, action, details, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [user_id, action, details]
    );
    
    res.json({ success: true, message: 'Log recorded' });
    
  } catch (error) {
    console.error('Log endpoint error:', error);
    res.status(500).json({ error: 'Failed to record log' });
  }
});

// Start bot for user
router.post('/start/:userId', isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Only allow users to start their own bot (or admin)
    if (req.session.user.id !== userId && req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check license
    if (user.license_status !== 'active') {
      return res.status(403).json({ error: 'License inactive' });
    }
    
    // Send request to Python bot
    const axios = require('axios');
    try {
      const response = await axios.post('http://localhost:5000/bot/start', {
        userId: userId,
        config: {
          auto_accept: user.auto_accept || false,
          min_block_value: user.min_block_value || 0,
          bot_token: user.bot_token || ''
        }
      });
      
      // Log the action
      await db.run(
        `INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)`,
        [userId, 'bot_started', 'User started the bot']
      );
      
      res.json({ success: true, message: 'Bot started successfully' });
      
    } catch (pythonError) {
      console.error('Python bot error:', pythonError.message);
      res.status(500).json({ error: 'Failed to communicate with bot service' });
    }
    
  } catch (error) {
    console.error('Start bot error:', error);
    res.status(500).json({ error: 'Failed to start bot' });
  }
});

// Stop bot for user
router.post('/stop/:userId', isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Only allow users to stop their own bot (or admin)
    if (req.session.user.id !== userId && req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Send request to Python bot
    const axios = require('axios');
    try {
      const response = await axios.post('http://localhost:5000/bot/stop', {
        userId: userId
      });
      
      // Log the action
      await db.run(
        `INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)`,
        [userId, 'bot_stopped', 'User stopped the bot']
      );
      
      res.json({ success: true, message: 'Bot stopped successfully' });
      
    } catch (pythonError) {
      console.error('Python bot error:', pythonError.message);
      res.status(500).json({ error: 'Failed to communicate with bot service' });
    }
    
  } catch (error) {
    console.error('Stop bot error:', error);
    res.status(500).json({ error: 'Failed to stop bot' });
  }
});

// Get bot status for user
router.get('/status/:userId', isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Only allow users to check their own status (or admin)
    if (req.session.user.id !== userId && req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Get status from Python bot
    const axios = require('axios');
    try {
      const response = await axios.get(`http://localhost:5000/bot/status/${userId}`);
      res.json(response.data);
    } catch (pythonError) {
      // If Python bot is not responding, return default status
      res.json({
        user_id: userId,
        is_running: false,
        session_active: false,
        last_check: null
      });
    }
    
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

module.exports = router;
