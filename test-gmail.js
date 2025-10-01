// Test Gmail Connection
// Run this with: node test-gmail.js

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testGmailConnection() {
  console.log('🔍 Testing Gmail Configuration...');
  console.log('Gmail User:', process.env.GMAIL_USER);
  console.log('App Password exists:', !!process.env.GMAIL_APP_PASSWORD);
  console.log('App Password length:', process.env.GMAIL_APP_PASSWORD?.length);

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
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Test sending email
    console.log('📤 Sending test email...');
    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'megharaj2004.ai@gmail.com',
      subject: 'Test Email from Contact Form',
      html: '<h2>Test Email</h2><p>If you receive this, email setup is working!</p>'
    });
    
    console.log('✅ Test email sent successfully!', result.messageId);
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔧 SOLUTION:');
      console.log('1. Make sure 2-Step Verification is enabled on your Gmail account');
      console.log('2. Generate a new App Password:');
      console.log('   - Go to https://myaccount.google.com/apppasswords');
      console.log('   - Select "Mail" and generate a new password');
      console.log('   - Update your .env.local file with the new password');
      console.log('3. App password should be 16 characters (like: abcd efgh ijkl mnop)');
    }
  }
}

testGmailConnection();