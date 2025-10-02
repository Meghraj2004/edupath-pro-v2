// Quick test script to verify Gmail credentials
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testEmailSetup() {
  console.log('🔍 Testing Email Configuration...\n');
  
  // Check environment variables
  console.log('📧 Gmail User:', process.env.GMAIL_USER || '❌ NOT SET');
  console.log('🔐 App Password:', process.env.GMAIL_APP_PASSWORD ? '✅ SET' : '❌ NOT SET');
  console.log('');

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ Gmail credentials are not configured in .env.local');
    console.log('\nPlease configure:');
    console.log('  GMAIL_USER=your-email@gmail.com');
    console.log('  GMAIL_APP_PASSWORD=your-app-password\n');
    process.exit(1);
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
    
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Send to yourself
      subject: '✅ Test Email - EduPath Pro Setup Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">✅ Email Configuration Successful!</h2>
          <p>Your Gmail credentials are correctly configured for EduPath Pro.</p>
          <p>The contact form email notifications will now work properly.</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated test email sent at ${new Date().toLocaleString()}
          </p>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('\n🎉 Email setup is working correctly!');
    console.log('💡 Check your inbox:', process.env.GMAIL_USER);
    
  } catch (error) {
    console.error('\n❌ Email test failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('   1. Is 2-Step Verification enabled on your Google Account?');
      console.log('   2. Did you generate an App Password (not your regular password)?');
      console.log('   3. Is the App Password correct in .env.local?');
      console.log('\n🔗 Generate App Password: https://myaccount.google.com/apppasswords');
    }
    
    process.exit(1);
  }
}

testEmailSetup();
