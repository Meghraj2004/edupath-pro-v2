# 🚀 Quick Setup Guide - Email Notifications

Your contact form is working, but email notifications are not configured yet. Follow these simple steps:

## ⚡ Quick Setup (5 minutes)

### Step 1: Create .env.local file
Create a file named `.env.local` in the root directory of your project (next to `package.json`).

### Step 2: Get Gmail App Password

1. **Enable 2-Factor Authentication**:
   - Go to your Google Account: https://myaccount.google.com/security
   - Enable "2-Step Verification" if not already enabled

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Sign in if prompted
   - Select "Mail" as the app
   - Click "Generate"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Configure .env.local

Add these lines to your `.env.local` file:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

**Example:**
```env
GMAIL_USER=megharaj2004.ai@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

### Step 4: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it:
npm run dev
```

## ✅ Testing

1. Go to the Contact page on your website
2. Fill out and submit the form
3. Check the configured Gmail inbox for the notification email
4. Form data will also be saved in Firestore database

## 🔒 Security Notes

- ✅ `.env.local` is in `.gitignore` - your credentials won't be committed
- ✅ App passwords are safer than using your regular password
- ✅ Email API only runs on the server - credentials never exposed to clients

## 🐛 Troubleshooting

### "Email service not configured" error
- Make sure `.env.local` file exists in the root directory
- Verify environment variables are spelled correctly
- Restart your development server after creating `.env.local`

### Email not being received
- Check Gmail spam folder
- Verify the App Password is correct (no spaces)
- Ensure 2-Factor Authentication is enabled on your Google Account
- Check server console logs for specific errors

### Still having issues?
- Check the detailed guide: `EMAIL_SETUP_GUIDE.md`
- Verify your `.env.local` file is in the correct location
- Run `npm run dev` again to reload environment variables

## 📝 Production Deployment

When deploying to Vercel/production:

1. Add environment variables in your hosting platform's dashboard
2. Do NOT commit `.env.local` to git
3. Use the same variable names: `GMAIL_USER` and `GMAIL_APP_PASSWORD`

---

**Current Status**: Form data is being saved to Firestore ✅ | Email notifications need setup ⚠️
