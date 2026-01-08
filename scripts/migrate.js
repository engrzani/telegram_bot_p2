const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database/delivery_monitor.db');
const db = new sqlite3.Database(DB_PATH);

async function migrate() {
  console.log('🔧 Running database migrations...');

  db.serialize(() => {
    // Add bot settings columns to users table
    db.run(`ALTER TABLE users ADD COLUMN bot_token TEXT`, (err) => {
      if (err && !err.message.includes('duplicate')) {
        console.error('❌ Error adding bot_token:', err);
      } else {
        console.log('✅ Added bot_token column');
      }
    });

    db.run(`ALTER TABLE users ADD COLUMN auto_accept INTEGER DEFAULT 0`, (err) => {
      if (err && !err.message.includes('duplicate')) {
        console.error('❌ Error adding auto_accept:', err);
      } else {
        console.log('✅ Added auto_accept column');
      }
    });

    db.run(`ALTER TABLE users ADD COLUMN min_block_value REAL DEFAULT 0`, (err) => {
      if (err && !err.message.includes('duplicate')) {
        console.error('❌ Error adding min_block_value:', err);
      } else {
        console.log('✅ Added min_block_value column');
      }
    });

    db.run(`ALTER TABLE users ADD COLUMN email_notifications INTEGER DEFAULT 1`, (err) => {
      if (err && !err.message.includes('duplicate')) {
        console.error('❌ Error adding email_notifications:', err);
      } else {
        console.log('✅ Added email_notifications column');
      }
    });

    db.run(`ALTER TABLE users ADD COLUMN telegram_notifications INTEGER DEFAULT 1`, (err) => {
      if (err && !err.message.includes('duplicate')) {
        console.error('❌ Error adding telegram_notifications:', err);
      } else {
        console.log('✅ Added telegram_notifications column');
      }
    });

    // Create delivery block logs table
    db.run(`
      CREATE TABLE IF NOT EXISTS delivery_block_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        block_id TEXT NOT NULL,
        pickup_location TEXT,
        delivery_location TEXT,
        payout REAL,
        result TEXT DEFAULT 'pending',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating delivery_block_logs table:', err);
      } else {
        console.log('✅ Delivery block logs table created');
      }
    });

    // Insert sample delivery block logs for demo user
    setTimeout(() => {
      db.get('SELECT id FROM users WHERE email = ?', ['demo@example.com'], (err, user) => {
        if (err || !user) {
          console.log('⚠️  Demo user not found, skipping sample logs');
          db.close();
          return;
        }

        const sampleLogs = [
          { block_id: 'XYZ789', pickup: 'Downtown Hub, NYC', delivery: 'Brooklyn Heights, NYC', payout: 25.50, result: 'accepted' },
          { block_id: 'ABC123', pickup: 'Queens Plaza, NYC', delivery: 'Long Island City, NYC', payout: 38.25, result: 'ignored' },
          { block_id: 'DEF456', pickup: 'Midtown West, NYC', delivery: 'Upper East Side, NYC', payout: 32.00, result: 'accepted' },
          { block_id: 'GHI901', pickup: 'Staten Island Ferry, NYC', delivery: 'Financial District, NYC', payout: 20.00, result: 'accepted' },
          { block_id: 'JKL234', pickup: 'JFK Airport, NYC', delivery: 'Newark Liberty Airport, NJ', payout: 65.75, result: 'accepted' },
          { block_id: 'MNO567', pickup: 'Chelsea, NYC', delivery: 'Greenwich Village, NYC', payout: 18.50, result: 'ignored' },
          { block_id: 'PQR890', pickup: 'Upper West Side, NYC', delivery: 'Harlem, NYC', payout: 22.00, result: 'accepted' },
          { block_id: 'STU123', pickup: 'Bronx Hub, NYC', delivery: 'Yonkers, NY', payout: 29.75, result: 'pending' }
        ];

        sampleLogs.forEach((log, index) => {
          const timestamp = new Date(Date.now() - (index * 3600000)).toISOString(); // Each log 1 hour apart
          db.run(
            `INSERT INTO delivery_block_logs (user_id, block_id, pickup_location, delivery_location, payout, result, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user.id, log.block_id, log.pickup, log.delivery, log.payout, log.result, timestamp],
            (err) => {
              if (err) {
                console.error(`❌ Error inserting sample log ${log.block_id}:`, err);
              }
            }
          );
        });

        setTimeout(() => {
          console.log('✅ Sample delivery block logs inserted');
          db.close(() => {
            console.log('✅ Migration complete!');
          });
        }, 500);
      });
    }, 100);
  });
}

migrate();
