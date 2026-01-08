const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Login page
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { title: 'Login', error: null });
});

// Login POST
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('login', {
      title: 'Login',
      error: 'Invalid email or password'
    });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.render('login', {
        title: 'Login',
        error: 'Invalid email or password'
      });
    }

    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.render('login', {
        title: 'Login',
        error: 'Invalid email or password'
      });
    }

    // Store user in session
    req.session.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      license_status: user.license_status
    };

    // Log the activity
    await ActivityLog.create({
      user_id: user.id,
      action: 'login',
      details: 'User logged in',
      ip_address: req.ip
    });

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', {
      title: 'Login',
      error: 'An error occurred. Please try again.'
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  if (req.session.user) {
    ActivityLog.create({
      user_id: req.session.user.id,
      action: 'logout',
      details: 'User logged out',
      ip_address: req.ip
    }).catch(err => console.error('Log error:', err));
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
    }
    res.redirect('/auth/login');
  });
});

module.exports = router;
