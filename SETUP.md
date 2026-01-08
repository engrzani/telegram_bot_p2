# Setup Instructions - Delivery Block Monitor

## Windows Setup Guide

### Step 1: Install Node.js

1. Download Node.js from https://nodejs.org/ (LTS version recommended)
2. Run the installer
3. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

### Step 2: Setup Project

1. Open Command Prompt or PowerShell
2. Navigate to project folder:
   ```cmd
   cd c:\telegram_bot_p2
   ```

3. Install dependencies:
   ```cmd
   npm install
   ```
   
   Wait for all packages to download and install.

### Step 3: Configure Environment

1. Create `.env` file from template:
   ```cmd
   copy .env.example .env
   ```

2. Edit `.env` file with Notepad:
   ```cmd
   notepad .env
   ```

3. Update these values:
   ```
   JWT_SECRET=your-super-secret-random-string-here
   SESSION_SECRET=your-another-secret-random-string-here
   ADMIN_EMAIL=youremail@example.com
   ADMIN_PASSWORD=YourSecurePassword123
   ```

4. Save and close the file

### Step 4: Initialize Database

```cmd
npm run init-db
```

**Important:** Note the admin credentials shown in console output!

Output will look like:
```
✅ Admin user created
   Email: youremail@example.com
   Password: YourSecurePassword123
✅ Demo user created
   Email: demo@example.com
   Password: demo123
```

### Step 5: Start the Server

**Production mode:**
```cmd
npm start
```

**Development mode (with auto-reload):**
```cmd
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
📱 Environment: development
✅ Connected to SQLite database
```

### Step 6: Access the Application

1. Open your web browser
2. Go to: `http://localhost:3000`
3. You'll be redirected to login page
4. Login with admin credentials

## Testing the Application

### Test as Admin
1. Login with admin credentials
2. You should see:
   - Admin Dashboard
   - All users list
   - License management buttons
   - System activity logs
3. Try updating a user's license status

### Test as Regular User
1. Logout
2. Login as demo user (demo@example.com / demo123)
3. You should see:
   - User Dashboard
   - License status (Active)
   - Activity logs
   - Profile page
4. Note: No admin panel access

## Common Issues and Solutions

### Issue: "Port 3000 is already in use"

**Solution:**
1. Edit `.env` file
2. Change `PORT=3000` to `PORT=3001`
3. Restart server

Or kill the process using port 3000:
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Issue: "Cannot find module"

**Solution:**
```cmd
del package-lock.json
rmdir /s /q node_modules
npm install
```

### Issue: "Database is locked"

**Solution:**
```cmd
# Stop the server (Ctrl+C)
# Delete lock file
del database\delivery_monitor.db-journal
# Restart server
npm start
```

### Issue: "Cannot login"

**Solution 1:** Re-initialize database
```cmd
del database\delivery_monitor.db
npm run init-db
```

**Solution 2:** Clear browser cookies
- Press F12 in browser
- Go to Application tab
- Clear cookies for localhost

### Issue: Views not rendering properly

**Solution:** Clear browser cache
- Press Ctrl+Shift+Delete
- Clear cached images and files
- Refresh page (Ctrl+F5)

## Firewall Configuration

If accessing from another device on the network:

1. Allow Node.js through Windows Firewall:
   ```cmd
   netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=3000
   ```

2. Find your IP address:
   ```cmd
   ipconfig
   ```
   Look for "IPv4 Address"

3. Access from other device:
   ```
   http://YOUR_IP_ADDRESS:3000
   ```

## Production Deployment

### Using PM2 (Recommended)

1. Install PM2 globally:
   ```cmd
   npm install -g pm2
   ```

2. Start application:
   ```cmd
   pm2 start server.js --name delivery-monitor
   ```

3. Setup auto-start on boot:
   ```cmd
   pm2 startup
   pm2 save
   ```

4. Monitor application:
   ```cmd
   pm2 status
   pm2 logs delivery-monitor
   pm2 monit
   ```

### Using Windows Service

1. Install node-windows:
   ```cmd
   npm install -g node-windows
   ```

2. Create service script (install-service.js):
   ```javascript
   var Service = require('node-windows').Service;
   
   var svc = new Service({
     name: 'Delivery Monitor',
     description: 'Delivery Block Monitoring System',
     script: 'C:\\telegram_bot_p2\\server.js'
   });
   
   svc.on('install', function() {
     svc.start();
   });
   
   svc.install();
   ```

3. Install service:
   ```cmd
   node install-service.js
   ```

## Database Backup

### Manual Backup
```cmd
copy database\delivery_monitor.db database\backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.db
```

### Automated Backup Script (backup.bat)
```batch
@echo off
set BACKUP_DIR=database\backups
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
copy database\delivery_monitor.db %BACKUP_DIR%\backup_%TIMESTAMP%.db
echo Backup created: backup_%TIMESTAMP%.db
```

Run backup:
```cmd
backup.bat
```

## Security Checklist

Before production deployment:

- [ ] Change `JWT_SECRET` in .env
- [ ] Change `SESSION_SECRET` in .env
- [ ] Change default admin password
- [ ] Set `NODE_ENV=production` in .env
- [ ] Enable HTTPS (use reverse proxy like nginx)
- [ ] Setup firewall rules
- [ ] Regular database backups
- [ ] Monitor server logs
- [ ] Keep Node.js updated

## Updating the Application

```cmd
# Stop server
# Backup database
copy database\delivery_monitor.db database\backup.db

# Pull latest code (if using git)
git pull

# Install new dependencies
npm install

# Restart server
npm start
```

## Monitoring and Logs

### View Server Logs
If using PM2:
```cmd
pm2 logs delivery-monitor
```

### Check Error Logs
Logs are in console output. To save to file:
```cmd
npm start > logs\app.log 2>&1
```

### Monitor Resource Usage
```cmd
# Check Node.js processes
tasklist | findstr node

# Monitor system resources
resmon
```

## Getting Help

If you encounter issues:

1. Check console output for errors
2. Check browser console (F12) for client errors
3. Verify all steps were followed correctly
4. Ensure Node.js version is compatible (v16+)
5. Check database file exists and is not corrupted

## Next Steps

After successful Milestone 1 setup:
1. Test all features thoroughly
2. Create test user accounts
3. Verify license management works
4. Check mobile responsiveness
5. Review and approve Milestone 1
6. Proceed to Milestone 2 development

---

**Support:** Keep this document for reference during setup and troubleshooting.
