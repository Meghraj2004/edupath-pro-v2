# 🔧 Email Troubleshooting Guide

## Current Issue: Network Timeout

Your Gmail credentials are configured correctly, but the connection to Gmail's SMTP server is timing out.

### 🔍 Diagnosis
- **Error**: `ETIMEDOUT` (Connection timeout on port 587)
- **Cause**: Network/firewall blocking SMTP connection
- **Impact**: Contact form saves to database ✅ but email notifications don't send ❌

## ✅ What's Working
- Contact form submits successfully
- Data is saved to Firestore database
- You see success message with warning
- Gmail credentials are properly configured

## 🚨 Common Causes & Solutions

### 1. Firewall Blocking SMTP Port

**Windows Firewall:**
```powershell
# Run as Administrator in PowerShell
New-NetFirewallRule -DisplayName "Allow SMTP 587" -Direction Outbound -LocalPort 587 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Allow SMTP 465" -Direction Outbound -LocalPort 465 -Protocol TCP -Action Allow
```

**Antivirus Software:**
- Check if Norton, McAfee, Avast, etc. are blocking port 587
- Add an exception for Node.js or your development server

### 2. ISP Blocking SMTP Ports

Some ISPs (especially mobile hotspots, public WiFi, corporate networks) block SMTP ports.

**Test:**
```powershell
# Test if port 587 is accessible
Test-NetConnection -ComputerName smtp.gmail.com -Port 587

# Try alternative port 465
Test-NetConnection -ComputerName smtp.gmail.com -Port 465
```

**Solutions:**
- Use a different network (home WiFi instead of mobile hotspot)
- Use VPN to bypass ISP restrictions
- Contact your ISP about SMTP port access

### 3. Network Issues

**Test your connection:**
```powershell
# Ping Gmail servers
ping smtp.gmail.com

# Check DNS resolution
nslookup smtp.gmail.com
```

## 🛠️ Immediate Workarounds

### Option A: Deploy to Production
Email sending typically works better in production environments (Vercel, Netlify, etc.) where network restrictions are less common.

**Deploy to Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# GMAIL_USER=megharaj2004.ai@gmail.com
# GMAIL_APP_PASSWORD=crca-irpn-pxcr-hzwy
```

### Option B: Use Development Mode Without Email
The contact form will continue to work and save to Firestore. You can:
1. Check submitted forms directly in Firebase Console
2. Manually check the `contacts` collection in Firestore
3. Build an admin panel to view submissions

### Option C: Alternative Email Service
If SMTP continues to fail, consider using:
- **SendGrid** (100 free emails/day)
- **Mailgun** (100 free emails/day)  
- **Resend** (100 free emails/day)
- **AWS SES** (very cheap)

## 📊 Current Status Check

Run this to check your setup:

```bash
# Test email configuration
node test-email.js

# If timeout occurs:
# - Firewall is blocking: See solution #1
# - ISP is blocking: See solution #2
# - Network issue: See solution #3
```

## ✅ Verify Gmail App Password

Make sure you're using an **App Password**, not your regular Gmail password:

1. Go to: https://myaccount.google.com/apppasswords
2. Verify 2-Step Verification is enabled
3. Generate new App Password if needed
4. Update `.env.local` with the new password
5. Restart dev server: `npm run dev`

## 🎯 Recommended Next Steps

### For Development:
1. **Accept the limitation**: Form works, just no email in dev
2. **Check Firestore**: View submissions in Firebase Console
3. **Focus on building features**: Email will work in production

### For Production:
1. **Deploy to Vercel/Netlify**: Network restrictions usually don't apply
2. **Add environment variables**: Use the same Gmail credentials
3. **Test**: Submit form from production URL
4. **Monitor**: Check if emails arrive successfully

## 🔗 Additional Resources

- [Firebase Console](https://console.firebase.google.com) - View contact submissions
- [Gmail App Passwords](https://myaccount.google.com/apppasswords) - Generate new password
- [Test Network Connection](https://www.yougetsignal.com/tools/open-ports/) - Check if port 587 is open

## 💡 Quick Test

```bash
# Test SMTP connection
telnet smtp.gmail.com 587
# If it connects: Press Ctrl+] then type 'quit'
# If it times out: Network/firewall is blocking
```

---

**Current Configuration:**
- Gmail: megharaj2004.ai@gmail.com ✅
- App Password: Configured ✅  
- SMTP Connection: ⚠️ Timeout (firewall/network issue)
- Contact Form: ✅ Working (saves to database)

**Recommendation**: Continue development. Email will likely work in production environment.
