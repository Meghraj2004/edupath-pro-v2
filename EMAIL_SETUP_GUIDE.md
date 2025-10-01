# Email Setup Guide for Contact Form

## Setup Instructions

### 1. Configure Gmail App Password

To send emails from your contact form, you need to set up Gmail App Password:

1. **Enable 2-Step Verification** (if not already enabled):
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app
   - Generate a new password
   - Copy the 16-character password

3. **Update Environment Variables**:
   - Open `.env.local` file
   - Replace `your-email@gmail.com` with your Gmail address
   - Replace `your-app-password` with the generated app password

### 2. Example .env.local Configuration

```
GMAIL_USER=megharaj2004.ai@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

### 3. How It Works

1. User fills out the contact form
2. Form data is saved to Firestore database
3. Email notification is sent to `megharaj2004.ai@gmail.com`
4. Email contains all form details in a formatted layout

### 4. Testing

After setup:
1. Fill out the contact form on your website
2. Check `megharaj2004.ai@gmail.com` for the notification email
3. Form submissions are also stored in Firestore for record keeping

### 5. Security Notes

- Never commit `.env.local` to git (it's already in .gitignore)
- App passwords are more secure than using your regular Gmail password
- The email API only runs on your server, credentials are not exposed to clients