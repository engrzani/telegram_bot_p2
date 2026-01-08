# 🔴 CRITICAL INFORMATION NEEDED FROM CLIENT

## Before We Proceed with Amazon Flex Integration

To implement the Amazon Flex monitoring and automation (Phase 2-4), we need the following information from your client:

---

## 📋 PART A: Amazon Flex Access Details

### 1. Test Account Credentials
**Why needed:** To develop and test the automation safely

**Required:**
- Amazon Flex login email
- Amazon Flex password
- Preferred test region/location
- Is this a real active account or test account?

**Note:** We'll use this ONLY for development. Each end user will input their own credentials in the dashboard.

---

### 2. Amazon Flex Platform Details

**Current Questions:**
- [ ] Which platform does the client primarily use?
  - [ ] Amazon Flex **Web App** (flex.amazon.com)
  - [ ] Amazon Flex **Mobile App** (iOS/Android)
  - [ ] Both (specify which is more stable)

- [ ] Does Amazon Flex have an **official API**?
  - [ ] Yes (provide documentation if available)
  - [ ] No (we'll use web scraping/automation)
  - [ ] Unknown

- [ ] Are there any **known working automation tools** or methods the client has seen?
  - [ ] Yes (describe or share examples)
  - [ ] No
  - [ ] Using manual clicking currently

---

### 3. Block Monitoring Details

**Questions:**
- [ ] How often do new blocks appear?
  - [ ] Every few seconds
  - [ ] Every few minutes
  - [ ] Specific times of day
  - [ ] Random/unpredictable

- [ ] Where are blocks displayed?
  - [ ] Main dashboard page
  - [ ] Separate "Available Offers" page
  - [ ] Mobile app notifications
  - [ ] Other location (specify)

- [ ] What details are shown for each block?
  - [ ] Warehouse/station name
  - [ ] Start time and date
  - [ ] Duration (hours)
  - [ ] Payment amount
  - [ ] Distance/location
  - [ ] Other info (list)

- [ ] How fast do blocks disappear?
  - [ ] Instantly (within seconds)
  - [ ] Within 1-2 minutes
  - [ ] Varies
  - [ ] Don't know

---

### 4. Current User Flow

**Please describe or screenshot:**
1. **Login Process:**
   - Email/password login?
   - 2FA/OTP required?
   - CAPTCHA on login?
   - Any device verification?

2. **Block Acceptance:**
   - How many clicks to accept a block?
   - Is there a confirmation popup?
   - Any terms/conditions checkbox?
   - What happens after accepting?

3. **Daily Limits:**
   - Any limit on blocks per day?
   - Any limit on attempts?
   - Cooldown periods between attempts?

---

## 📋 PART B: Anti-Detection Requirements

### 5. Detection & Ban History

**Critical Questions:**
- [ ] Has the client been **banned or flagged** before?
  - [ ] Yes (describe what triggered it)
  - [ ] No
  - [ ] Yes, but account was reinstated

- [ ] What triggers detection in their experience?
  - [ ] Too many rapid requests
  - [ ] Using VPN/proxy
  - [ ] Bot-like behavior
  - [ ] Multiple devices
  - [ ] Other (specify)

- [ ] Current workarounds they use:
  - [ ] Manual delays between actions
  - [ ] Rotating proxies
  - [ ] Different devices
  - [ ] Residential IPs only
  - [ ] Other (specify)

---

### 6. Proxy Requirements

**Questions:**
- [ ] Do users need to provide their own proxies?
  - [ ] Yes - specify type (residential/datacenter/mobile)
  - [ ] No - system will handle it
  - [ ] Optional

- [ ] Proxy rotation frequency:
  - [ ] Every request
  - [ ] Every session
  - [ ] Daily
  - [ ] Weekly
  - [ ] No rotation needed

- [ ] Proxy format users will provide:
  - [ ] IP:Port
  - [ ] IP:Port:Username:Password
  - [ ] Proxy service API
  - [ ] Other format (specify)

---

## 📋 PART C: Check-In & Verification Bypass 🔒

### 7. Self Check-In Flow

**Current Process:**
- [ ] Describe the normal check-in process:
  - When does it happen? (before shift, at warehouse, etc.)
  - What steps are involved?
  - What verification is required?

**Questions:**
- [ ] Is selfie/photo verification required?
  - [ ] Yes, every time
  - [ ] Yes, first time only
  - [ ] Randomly
  - [ ] No longer required

- [ ] What happens if verification is skipped?
  - [ ] Shift canceled
  - [ ] Warning message
  - [ ] Account flagged
  - [ ] No consequence (works fine)

---

### 8. 🔒 VERIFICATION BYPASS METHOD (PRIVATE)

**You mentioned:** "There is an existing method/device that bypasses selfie/photo verification"

**We need to know:**

1. **What is the bypass method?**
   - [ ] Using a specific device/emulator
   - [ ] Sending pre-recorded photo
   - [ ] API manipulation
   - [ ] Exploiting a bug/workaround
   - [ ] Third-party tool
   - [ ] Other (describe in detail)

2. **Technical details:**
   - Software/tools required?
   - Code/scripts involved?
   - API endpoints used?
   - Headers/tokens needed?
   - Any documentation?

3. **Compatibility:**
   - Does it work with web automation?
   - Does it work with mobile automation?
   - Any limitations?
   - Success rate?

4. **Risk level:**
   - Is Amazon aware of this method?
   - Has it caused bans before?
   - How stable/reliable is it?
   - Any countermeasures from Amazon?

**⚠️ This information will be kept confidential and used only for this project.**

---

## 📋 PART D: Auto-Accept Rules

### 9. User Preferences

**Rules each user should be able to set:**

Currently implemented in database:
- [x] Minimum payout amount
- [x] Auto-accept on/off toggle

**Additional rules needed:**
- [ ] Preferred warehouse locations (list of names)
- [ ] Blocked warehouse locations (blacklist)
- [ ] Preferred time ranges (e.g., 6am-2pm only)
- [ ] Blocked time ranges (e.g., avoid weekends)
- [ ] Maximum duration (e.g., 4 hours max)
- [ ] Minimum duration (e.g., 2 hours min)
- [ ] Distance limit from home address
- [ ] Preferred days of week
- [ ] Block type preferences (Instant Offers vs Reserved)
- [ ] Other criteria (specify)

**Questions:**
- [ ] Should multiple rules be AND or OR logic?
  - Example: (Payout > $50) AND (Location = Downtown) AND (Time = Morning)
  - Or: Accept if ANY rule matches?

- [ ] Priority system needed?
  - Example: Prefer high-paying blocks even if time isn't ideal

---

## 📋 PART E: Notifications

### 10. Notification Preferences

**Call Notifications (Twilio):**
- [ ] When should system call users?
  - [ ] Block detected matching rules
  - [ ] Block successfully accepted
  - [ ] Bot stopped (error/license expired)
  - [ ] All of the above
  - [ ] Other scenarios

**SMS Notifications:**
- [ ] Same triggers as calls?
- [ ] Different triggers? (specify)

**Telegram Notifications:**
- [ ] Users will create their own Telegram bots?
  - [ ] Yes - users provide their bot token
  - [ ] No - system has one master bot
- [ ] What details to include in messages?
  - [ ] Block details (location, pay, time)
  - [ ] Accept success/failure
  - [ ] Bot status updates
  - [ ] All

**Email Notifications:**
- [ ] Users provide their own email?
- [ ] System sends from one email?
- [ ] What email service to use?
  - [ ] Gmail SMTP
  - [ ] SendGrid
  - [ ] AWS SES
  - [ ] Other (specify)

---

## 📋 PART F: Performance & Scale

### 11. Expected Usage

**Questions:**
- [ ] How many users expected initially?
  - [ ] 1-10 users
  - [ ] 10-50 users
  - [ ] 50-100 users
  - [ ] 100+ users

- [ ] How many concurrent bots running?
  - [ ] All users running 24/7
  - [ ] Users run on-demand
  - [ ] Peak hours only
  - [ ] Estimated number

- [ ] Check frequency per user:
  - [ ] Every 1-5 seconds (aggressive)
  - [ ] Every 10-30 seconds (moderate)
  - [ ] Every 1-2 minutes (safe)
  - [ ] User configurable

---

## 📋 PART G: Deployment

### 12. Hosting Environment

**Where will this run?**
- [ ] Client's own VPS/dedicated server
- [ ] AWS/Azure/Google Cloud
- [ ] Heroku/Railway/DigitalOcean
- [ ] Local machine
- [ ] Other (specify)

**Server specs needed:**
- [ ] What OS? (Windows/Linux preferred)
- [ ] What resources? (RAM, CPU, bandwidth)
- [ ] Multiple servers for scaling?

---

## 📋 SUMMARY - IMMEDIATE ACTION ITEMS

### 🔴 **MUST HAVE** (Cannot proceed without these):

1. **Amazon Flex test credentials** (email + password)
2. **Platform choice** (web app vs mobile app)
3. **Verification bypass method details** (technical specs)
4. **Current ban/detection history** (to understand risk)

### 🟡 **SHOULD HAVE** (Needed for Phase 2-3):

5. Block monitoring details (where, how often, what data)
6. Auto-accept flow (steps, clicks, confirmations)
7. Proxy requirements (type, rotation, format)
8. Additional rule preferences beyond minimum payout

### 🟢 **NICE TO HAVE** (Needed for Phase 4-5):

9. Notification service preferences (Twilio vs alternatives)
10. Expected scale and performance needs
11. Deployment environment details

---

## 📧 How to Provide This Information

**Option 1: Document Format**
- Copy this file
- Fill in all [ ] checkboxes
- Add descriptions where needed
- Send back as text/PDF

**Option 2: Video/Screenshots**
- Record screen showing the Amazon Flex flow
- Screenshot each step of block acceptance
- Show current manual process
- Explain detection bypass method

**Option 3: Live Demo**
- Schedule a call/screen share
- Walk through Amazon Flex account
- Demonstrate current process
- Answer questions in real-time

---

## ⏱️ Timeline

**Once we receive this information:**
- Phase 2 (Amazon Flex Integration): 5-7 days
- Phase 3 (Auto-Accept Logic): 3-4 days
- Phase 4 (Proxies & CAPTCHA): 3-4 days
- Phase 5 (Notifications): 2-3 days
- Phase 6 (Testing & Deployment): 3-5 days

**Total estimated:** 16-23 days after receiving complete information

**Current progress:** Foundation complete (40%), ready to build core features as soon as we have the above details.

---

## 🔒 Confidentiality

All information provided will be:
- Used solely for this project
- Not shared with third parties
- Kept secure and confidential
- Deleted after project completion if requested

---

**Next Steps:**
1. Client fills out this document
2. We review and clarify any questions
3. Development continues with Phase 2-6
4. Regular progress updates throughout

**System is currently running and ready! Just waiting for client details to proceed with Amazon Flex integration.**
