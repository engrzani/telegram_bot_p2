# Milestone 2 - Core System Planning

## Overview
This document outlines the technical approach for Milestone 2 implementation.

---

## 🎯 Milestone 2 Objectives

1. **Multi-User Delivery Block Monitoring**
2. **Per-User Session Handling**
3. **Proxy Configuration System**
4. **CAPTCHA Integration**
5. **Notification System (Telegram + Email)**
6. **Detailed Per-User Logging**

---

## 📋 Technical Requirements

### 1. Monitoring Engine

**Technology Choice:**
- **Playwright** (Recommended over Selenium)
  - Better performance
  - Built-in browser contexts
  - Easier proxy handling
  - Better mobile emulation

**Architecture:**
```
MonitoringService
├── UserSession (per user)
│   ├── Browser Context
│   ├── Proxy Settings
│   ├── CAPTCHA Handler
│   └── Notification Manager
└── BlockDetector
    ├── Page Scanner
    ├── Rule Engine
    └── Auto-Acceptor
```

**Implementation Plan:**
```javascript
class MonitoringService {
  constructor() {
    this.activeSessions = new Map(); // userId -> UserSession
  }

  async startMonitoring(userId) {
    // 1. Check license status
    // 2. Load user settings (proxy, captcha, rules)
    // 3. Create browser context
    // 4. Start monitoring loop
    // 5. Log activities
  }

  async stopMonitoring(userId) {
    // Clean up resources
  }
}
```

### 2. Proxy System

**Database Extension:**
Already prepared in `user_settings` table:
- proxy_host
- proxy_port
- proxy_username
- proxy_password

**UI Components:**
- Proxy configuration form
- Connection test button
- Proxy status indicator

**Implementation:**
```javascript
const proxyConfig = {
  server: `http://${host}:${port}`,
  username: user.proxy_username,
  password: user.proxy_password
};

// Per-user browser context with proxy
const context = await browser.newContext({
  proxy: proxyConfig
});
```

### 3. CAPTCHA Integration

**Supported Services:**
- 2Captcha
- Anti-Captcha

**Database Fields:**
Already in `user_settings`:
- captcha_service ('2captcha' or 'anticaptcha')
- captcha_api_key

**Implementation:**
```javascript
class CaptchaService {
  constructor(service, apiKey) {
    this.service = service;
    this.apiKey = apiKey;
  }

  async solve(captchaType, siteKey, pageUrl) {
    // Send to captcha service
    // Poll for result
    // Return solution
  }
}
```

**Auto-solve Flow:**
1. Detect CAPTCHA on page
2. Extract CAPTCHA parameters
3. Send to solving service
4. Wait for solution
5. Inject solution
6. Continue flow

### 4. Notification System

**Telegram Integration:**
```javascript
class TelegramNotifier {
  constructor(botToken, chatId) {
    this.botToken = botToken;
    this.chatId = chatId;
  }

  async send(message) {
    // Send via Telegram Bot API
  }
}
```

**Email Integration:**
```javascript
// Using nodemailer
class EmailNotifier {
  async send(to, subject, body) {
    // Send email
  }
}
```

**Notification Events:**
- Block detected
- Block accepted
- Block rejected (why)
- Error occurred
- Session started/stopped
- License expiring

**Database Storage:**
```sql
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  type TEXT,
  title TEXT,
  message TEXT,
  sent_via TEXT, -- 'telegram', 'email', 'both'
  status TEXT,   -- 'sent', 'failed'
  created_at DATETIME
);
```

### 5. Auto-Accept Rules Engine

**Rule Types:**

1. **Time-based:**
   ```json
   {
     "preferred_times": ["08:00-12:00", "18:00-22:00"]
   }
   ```

2. **Payout-based:**
   ```json
   {
     "min_payout": 50.00,
     "max_payout": null
   }
   ```

3. **Location-based:**
   ```json
   {
     "preferred_locations": ["New York", "Brooklyn"],
     "excluded_locations": ["Queens"]
   }
   ```

**Rule Evaluation:**
```javascript
class RuleEngine {
  evaluate(block, rules) {
    if (!this.checkTime(block.time, rules.preferred_times)) return false;
    if (!this.checkPayout(block.payout, rules.min_payout)) return false;
    if (!this.checkLocation(block.location, rules)) return false;
    return true;
  }
}
```

### 6. Enhanced Logging

**New Log Types:**
- `block_detected` - New block found
- `block_accepted` - Block auto-accepted
- `block_rejected` - Block rejected (with reason)
- `captcha_solved` - CAPTCHA encountered and solved
- `session_started` - Monitoring started
- `session_stopped` - Monitoring stopped
- `error_occurred` - Any error

**Log Structure:**
```javascript
{
  user_id: 123,
  action: 'block_detected',
  details: JSON.stringify({
    block_id: 'BLK123',
    time: '2026-01-08 18:00',
    location: 'New York',
    payout: 55.00
  }),
  timestamp: '2026-01-08 17:30:00'
}
```

---

## 🔧 New Dependencies (Milestone 2)

```json
{
  "playwright": "^1.40.0",
  "axios": "^1.6.0",
  "node-telegram-bot-api": "^0.64.0",
  "nodemailer": "^6.9.0",
  "winston": "^3.11.0",
  "cron": "^3.1.6"
}
```

---

## 📊 Database Extensions

### New Tables:

```sql
-- Monitoring sessions
CREATE TABLE monitoring_sessions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  status TEXT,      -- 'active', 'stopped', 'error'
  started_at DATETIME,
  stopped_at DATETIME,
  blocks_detected INTEGER DEFAULT 0,
  blocks_accepted INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0
);

-- Notifications
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  type TEXT,
  title TEXT,
  message TEXT,
  sent_via TEXT,
  status TEXT,
  created_at DATETIME
);

-- Auto-accept rules
CREATE TABLE auto_accept_rules (
  id INTEGER PRIMARY KEY,
  user_id INTEGER UNIQUE,
  rules_json TEXT,  -- JSON string of rules
  enabled BOOLEAN DEFAULT 1,
  created_at DATETIME,
  updated_at DATETIME
);
```

---

## 🎨 New UI Components (Milestone 2)

### 1. Settings Page
- Proxy configuration form
- CAPTCHA service selection
- Notification preferences
- Auto-accept rules builder

### 2. Monitoring Control Panel
- Start/Stop button
- Real-time status
- Session statistics
- Live log feed

### 3. Blocks History Page
- Table of detected blocks
- Accept/reject status
- Payout information
- Time filtering

### 4. Rules Builder
- Visual rule creator
- Time picker
- Location selector
- Payout range slider

---

## 🔐 Security Considerations

1. **API Keys:** Encrypt CAPTCHA keys in database
2. **Proxies:** Encrypt proxy passwords
3. **Sessions:** Isolate browser contexts per user
4. **Rate Limiting:** Prevent API abuse
5. **Resource Limits:** Limit concurrent sessions per user

---

## 🚀 Deployment Strategy

### Development:
- Local testing
- Single user monitoring
- Mock CAPTCHA service

### Staging:
- Multiple users
- Real CAPTCHA integration
- Production-like environment

### Production:
- Process manager (PM2)
- Database backups
- Log rotation
- Health monitoring

---

## 📈 Performance Targets

- Support 50+ concurrent users
- Block detection latency < 5 seconds
- CAPTCHA solving < 30 seconds
- Notification delivery < 3 seconds
- 99% uptime during monitoring

---

## 🧪 Testing Plan

1. **Unit Tests:**
   - Rule engine logic
   - Notification sending
   - Database operations

2. **Integration Tests:**
   - End-to-end monitoring flow
   - CAPTCHA integration
   - Proxy connectivity

3. **Load Tests:**
   - Multiple concurrent users
   - Resource usage monitoring

---

## 📅 Estimated Timeline

- **Week 1:** Monitoring engine + Proxy system
- **Week 2:** CAPTCHA integration + Rule engine
- **Week 3:** Notifications + Enhanced logging
- **Week 4:** UI improvements + Testing

---

## ✅ Milestone 2 Completion Criteria

- [ ] Multi-user monitoring works simultaneously
- [ ] Proxy configuration per user functional
- [ ] CAPTCHA auto-solving integrated
- [ ] Telegram notifications working
- [ ] Email notifications working
- [ ] Auto-accept rules engine operational
- [ ] Enhanced logging visible in UI
- [ ] All features tested with multiple users
- [ ] Documentation updated

---

**Note:** This plan will be refined based on Milestone 1 feedback and approval.
