const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database/delivery_monitor.db');
const dbDir = path.dirname(DB_PATH);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

async function initDatabase() {
  console.log('🔧 Initializing database...');

  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        license_status TEXT DEFAULT 'inactive',
        license_expiry DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating users table:', err);
      } else {
        console.log('✅ Users table created');
      }
    });

    // Activity logs table
    db.run(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating activity_logs table:', err);
      } else {
        console.log('✅ Activity logs table created');
      }
    });

    // Delivery blocks table (for logging found blocks)
    db.run(`
      CREATE TABLE IF NOT EXISTS delivery_blocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        block_id TEXT,
        block_time TEXT,
        location TEXT,
        payout REAL,
        status TEXT DEFAULT 'detected',
        accepted_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating delivery_blocks table:', err);
      } else {
        console.log('✅ Delivery blocks table created');
      }
    });

    // User settings table (for proxies, captcha keys, etc.)
    db.run(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        proxy_host TEXT,
        proxy_port INTEGER,
        proxy_username TEXT,
        proxy_password TEXT,
        captcha_service TEXT,
        captcha_api_key TEXT,
        telegram_chat_id TEXT,
        email_notifications BOOLEAN DEFAULT 0,
        telegram_notifications BOOLEAN DEFAULT 0,
        auto_accept_enabled BOOLEAN DEFAULT 0,
        min_payout REAL,
        preferred_times TEXT,
        preferred_locations TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating user_settings table:', err);
      } else {
        console.log('✅ User settings table created');
      }
    });

    // Create default admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    bcrypt.hash(adminPassword, 10, (err, hashedPassword) => {
      if (err) {
        console.error('❌ Error hashing password:', err);
        return;
      }

      db.run(`
        INSERT OR IGNORE INTO users (email, password, full_name, role, license_status)
        VALUES (?, ?, ?, ?, ?)
      `, [adminEmail, hashedPassword, 'Administrator', 'admin', 'active'], (err) => {
        if (err) {
          console.error('❌ Error creating admin user:', err);
        } else {
          console.log('✅ Admin user created');
          console.log(`   Email: ${adminEmail}`);
          console.log(`   Password: ${adminPassword}`);
        }
      });
    });

    // Create a demo user
    bcrypt.hash('demo123', 10, (err, hashedPassword) => {
      if (err) {
        console.error('❌ Error hashing demo password:', err);
        return;
      }

      db.run(`
        INSERT OR IGNORE INTO users (email, password, full_name, role, license_status, license_expiry)
        VALUES (?, ?, ?, ?, ?, datetime('now', '+30 days'))
      `, ['demo@example.com', hashedPassword, 'Demo User', 'user', 'active'], (err) => {
        if (err) {
          console.error('❌ Error creating demo user:', err);
        } else {
          console.log('✅ Demo user created');
          console.log('   Email: demo@example.com');
          console.log('   Password: demo123');
        }
        
        // Close the database after the last operation
        setTimeout(() => {
          db.close((err) => {
            if (err) {
              console.error('❌ Error closing database:', err);
            } else {
              console.log('✅ Database initialization complete!');
            }
          });
        }, 100);
      });
    });
  });
}

initDatabase();
