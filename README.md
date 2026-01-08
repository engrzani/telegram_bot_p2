# Delivery Block Monitor - Multi-User System

A comprehensive Node.js-based system for monitoring and auto-accepting delivery blocks with multi-user support, license management, and detailed activity logging.

## 📋 Milestone 1 - Prototype (Current)

✅ **Completed Features:**
- Mobile-friendly responsive dashboard
- User authentication system (login/logout)
- License status management (active/inactive/expired)
- Basic activity logging per user
- Admin panel for user management
- Multi-user support with role-based access

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or download the project:**
   ```bash
   cd c:\telegram_bot_p2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and update:
   - `JWT_SECRET` - Change to a secure random string
   - `SESSION_SECRET` - Change to a secure random string
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD` - Set your admin credentials

4. **Initialize the database:**
   ```bash
   npm run init-db
   ```
   
   This creates:
   - SQLite database with all required tables
   - Admin user (check console output for credentials)
   - Demo user (demo@example.com / demo123)

5. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Access the application:**
   - Open browser: `http://localhost:3000`
   - Login with admin credentials or demo account

## 👥 Default Accounts

### Admin Account
- **Email:** admin@example.com (or from .env)
- **Password:** admin123 (or from .env)
- **Features:** Full system access, user management

### Demo User Account
- **Email:** demo@example.com
- **Password:** demo123
- **License:** Active (30 days trial)

## 📱 Features (Milestone 1)

### User Features
- ✅ Secure login/logout
- ✅ Dashboard overview with stats
- ✅ License status display
- ✅ Activity logs viewer
- ✅ Profile page
- ✅ Mobile-responsive design

### Admin Features
- ✅ Admin dashboard
- ✅ View all users
- ✅ Manage license status (activate/deactivate/expire)
- ✅ Set license expiry dates
- ✅ View system-wide activity logs
- ✅ User statistics

### License Management
- **Active:** Full access to all features
- **Inactive:** Account exists but monitoring paused
- **Expired:** License has expired, monitoring paused

## 🗂️ Project Structure

```
telegram_bot_p2/
├── database/
│   ├── db.js                 # Database connection
│   └── delivery_monitor.db   # SQLite database (auto-created)
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── User.js              # User model
│   └── ActivityLog.js       # Activity log model
├── public/
│   ├── css/
│   │   └── style.css        # Custom styles
│   └── js/
│       └── script.js        # Client-side scripts
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── dashboard.js         # Dashboard routes
│   └── admin.js             # Admin routes
├── scripts/
│   └── initDatabase.js      # Database initialization
├── views/
│   ├── admin/
│   │   └── dashboard.ejs    # Admin dashboard
│   ├── dashboard.ejs        # User dashboard
│   ├── error.ejs            # Error page
│   ├── layout.ejs           # Main layout
│   ├── license-expired.ejs  # License expired page
│   ├── login.ejs            # Login page
│   ├── logs.ejs             # Activity logs
│   └── profile.ejs          # User profile
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
├── server.js               # Main server file
└── README.md               # This file
```

## 🔐 Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password` - Hashed password
- `full_name` - User's full name
- `role` - 'admin' or 'user'
- `license_status` - 'active', 'inactive', or 'expired'
- `license_expiry` - Expiration date
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Activity Logs Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `action` - Type of action
- `details` - Action details
- `ip_address` - User's IP
- `timestamp` - When action occurred

### Delivery Blocks Table (Ready for Milestone 2)
- `id` - Primary key
- `user_id` - Foreign key to users
- `block_id` - Delivery block identifier
- `block_time` - Scheduled time
- `location` - Delivery location
- `payout` - Payment amount
- `status` - 'detected', 'accepted', etc.
- `created_at` - Detection timestamp

### User Settings Table (Ready for Milestone 2)
- Proxy configuration
- CAPTCHA service settings
- Notification preferences
- Auto-accept rules

## 🔧 API Endpoints

### Authentication
- `GET /auth/login` - Login page
- `POST /auth/login` - Process login
- `GET /auth/logout` - Logout

### Dashboard
- `GET /dashboard` - User dashboard
- `GET /dashboard/logs` - Activity logs
- `GET /dashboard/profile` - User profile

### Admin (Admin Only)
- `GET /admin` - Admin dashboard
- `POST /admin/user/:id/license` - Update user license
- `GET /admin/users` - Get all users (API)

## 🎨 Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Authentication:** bcryptjs, express-session, JWT
- **View Engine:** EJS
- **Frontend:** Bootstrap 5, Bootstrap Icons
- **Security:** Helmet, express-validator

## 📊 Upcoming Milestones

### Milestone 2 - Core System
- [ ] Delivery block monitoring engine
- [ ] Per-user session handling
- [ ] Proxy configuration (per user)
- [ ] CAPTCHA integration (2Captcha/Anti-Captcha)
- [ ] Telegram notifications
- [ ] Email notifications
- [ ] Auto-accept rules engine
- [ ] Enhanced logging

### Milestone 3 - Final Delivery
- [ ] Full system testing
- [ ] Performance optimization
- [ ] Enhanced admin controls
- [ ] Detailed deployment guide
- [ ] Production hardening
- [ ] Complete documentation

## 🛠️ Development

### Running in Development Mode
```bash
npm run dev
```
This uses `nodemon` for auto-restart on file changes.

### Database Management

**Reset database:**
```bash
# Delete the database file
del database\delivery_monitor.db

# Reinitialize
npm run init-db
```

**Backup database:**
```bash
copy database\delivery_monitor.db database\backup_YYYYMMDD.db
```

## 🔒 Security Features

- Password hashing with bcrypt
- Session-based authentication
- CSRF protection ready
- SQL injection prevention
- XSS protection via Helmet
- Input validation
- Role-based access control

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `JWT_SECRET` | JWT signing key | (change this!) |
| `SESSION_SECRET` | Session key | (change this!) |
| `DB_PATH` | Database location | ./database/delivery_monitor.db |
| `ADMIN_EMAIL` | Admin email | admin@example.com |
| `ADMIN_PASSWORD` | Admin password | admin123 |

## 🐛 Troubleshooting

### Port already in use
```bash
# Change PORT in .env file
PORT=3001
```

### Database locked
```bash
# Close all connections and restart server
# Or delete .db-journal file
```

### Cannot login
- Ensure database is initialized: `npm run init-db`
- Check credentials in console output
- Clear browser cookies

## 📱 Mobile Access

The dashboard is fully responsive and works on:
- ✅ Mobile phones (iOS/Android)
- ✅ Tablets
- ✅ Desktop browsers
- ✅ Different screen sizes

## 🤝 Support

For issues or questions about Milestone 1:
1. Check this README
2. Review console logs
3. Check browser console for errors
4. Verify database initialization

## 📄 License

This is a proprietary system developed for delivery block monitoring. All rights reserved.

## ✅ Milestone 1 Completion Checklist

- [x] Project setup and dependencies
- [x] Database schema design
- [x] User authentication system
- [x] Mobile-friendly dashboard UI
- [x] License status management
- [x] Basic activity logging
- [x] Admin panel
- [x] User profile pages
- [x] Responsive design
- [x] Setup documentation

---

**Next Steps:** After Milestone 1 approval, we will proceed with Milestone 2 implementation (Core monitoring system, proxies, CAPTCHA, notifications).
