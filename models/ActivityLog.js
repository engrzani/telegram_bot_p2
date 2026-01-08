const db = require('../database/db');

class ActivityLog {
  static async create(logData) {
    const { user_id, action, details = null, ip_address = null } = logData;

    try {
      const result = await db.run(
        'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
        [user_id, action, details, ip_address]
      );
      return result.id;
    } catch (error) {
      throw error;
    }
  }

  static async getByUserId(userId, limit = 50) {
    try {
      return await db.all(
        'SELECT * FROM activity_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?',
        [userId, limit]
      );
    } catch (error) {
      throw error;
    }
  }

  static async getAll(limit = 100) {
    try {
      return await db.all(
        `SELECT al.*, u.email, u.full_name 
         FROM activity_logs al 
         JOIN users u ON al.user_id = u.id 
         ORDER BY al.timestamp DESC 
         LIMIT ?`,
        [limit]
      );
    } catch (error) {
      throw error;
    }
  }

  static async deleteOldLogs(daysToKeep = 30) {
    try {
      await db.run(
        `DELETE FROM activity_logs WHERE timestamp < datetime('now', '-${daysToKeep} days')`
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ActivityLog;
