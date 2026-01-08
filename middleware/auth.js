const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if user is authenticated via session
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/auth/login');
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).render('error', {
    title: 'Access Denied',
    message: 'You do not have permission to access this page',
    error: { status: 403 }
  });
};

// Middleware to check license status
const hasActiveLicense = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/auth/login');
    }

    const isActive = await User.checkLicenseStatus(req.session.user.id);
    
    if (!isActive) {
      return res.render('license-expired', {
        title: 'License Inactive',
        user: req.session.user
      });
    }

    next();
  } catch (error) {
    console.error('License check error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error checking license status',
      error: {}
    });
  }
};

// Middleware to verify JWT token (for API endpoints)
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1] || req.query.token;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userId = decoded.id;
    next();
  });
};

module.exports = {
  isAuthenticated,
  isAdmin,
  hasActiveLicense,
  verifyToken
};
