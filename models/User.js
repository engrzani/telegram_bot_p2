const db = require('../database/db');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    try {
      return await db.get('SELECT * FROM users WHERE email = ?', [email]);
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      return await db.get('SELECT * FROM users WHERE id = ?', [id]);
    } catch (error) {
      throw error;
    }
  }

  static async create(userData) {
    const { email, password, full_name, role = 'user' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const result = await db.run(
        'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, full_name, role]
      );
      return result.id;
    } catch (error) {
      throw error;
    }
  }

  static async updateLicenseStatus(userId, status, expiry = null) {
    try {
      if (expiry) {
        await db.run(
          'UPDATE users SET license_status = ?, license_expiry = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [status, expiry, userId]
        );
      } else {
        await db.run(
          'UPDATE users SET license_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [status, userId]
        );
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getAllUsers() {
    try {
      return await db.all('SELECT id, email, full_name, role, license_status, license_expiry, created_at FROM users ORDER BY created_at DESC');
    } catch (error) {
      throw error;
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async checkLicenseStatus(userId) {
    try {
      const user = await this.findById(userId);
      if (!user) return false;

      if (user.license_status === 'inactive') return false;
      
      if (user.license_expiry) {
        const expiry = new Date(user.license_expiry);
        const now = new Date();
        
        if (expiry < now) {
          // License expired, update status
          await this.updateLicenseStatus(userId, 'expired');
          return false;
        }
      }

      return user.license_status === 'active';
    } catch (error) {
      throw error;
    }
  }

  static async updateProfile(userId, data) {
    try {
      const { full_name } = data;
      await db.run(
        'UPDATE users SET full_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [full_name, userId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async updateBotSettings(userId, data) {
    try {
      const { bot_token, auto_accept, min_block_value } = data;
      await db.run(
        'UPDATE users SET bot_token = ?, auto_accept = ?, min_block_value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [bot_token, auto_accept ? 1 : 0, min_block_value, userId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async updateNotifications(userId, data) {
    try {
      const { email_notifications, telegram_notifications } = data;
      // Add columns to users table if they don't exist
      await db.run(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications INTEGER DEFAULT 1
      `).catch(() => {});
      await db.run(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_notifications INTEGER DEFAULT 1
      `).catch(() => {});
      
      await db.run(
        'UPDATE users SET email_notifications = ?, telegram_notifications = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [email_notifications ? 1 : 0, telegram_notifications ? 1 : 0, userId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async updatePassword(userId, hashedPassword) {
    try {
      await db.run(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, userId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
