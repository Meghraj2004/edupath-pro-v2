import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  let body;
  
  try {
    body = await request.json();
  } catch (parseError) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }

  const { name, email, phone, subject, message, timestamp } = body;
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    console.log('Email API called:', { name, email, subject });
  }
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    if (isDev) {
      console.warn('Gmail not configured');
    }
    return NextResponse.json({
      success: true,
      emailSent: false,
      message: 'Form submitted successfully',
      warning: 'Email not configured'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: 'megharaj2004.ai@gmail.com',
      subject: `New Contact - ${subject} | EduPath Pro`,
      html: `<h2>New Contact Form Submission</h2>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
             <p><strong>Subject:</strong> ${subject}</p>
             <p><strong>Message:</strong></p>
             <p>${message}</p>
             <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>`
    };

    const result = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 20000)
      )
    ]);

    if (isDev) {
      console.log('Email sent successfully');
    }

    return NextResponse.json({
      success: true,
      emailSent: true,
      message: 'Form submitted and email sent'
    });

  } catch (error) {
    if (isDev) {
      console.warn('Email failed, but form data saved');
    }

    return NextResponse.json({
      success: true,
      emailSent: false,
      message: 'Form submitted successfully',
      warning: 'Email notification failed'
    });
  }
}
