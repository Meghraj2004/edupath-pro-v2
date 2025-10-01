import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Email API called');
    const body = await request.json();
    const { name, email, phone, subject, message, timestamp } = body;
    
    console.log('📝 Form data received:', { name, email, subject });
    console.log('🔑 Gmail user:', process.env.GMAIL_USER);
    console.log('🔐 App password exists:', !!process.env.GMAIL_APP_PASSWORD);

    // Create transporter with more specific Gmail configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Test connection
    console.log('🔍 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    // Email content
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: 'megharaj2004.ai@gmail.com',
      subject: `🎓 New Contact - ${subject} | EduPath Pro`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <div style="background-color: rgba(255,255,255,0.15); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 3px solid rgba(255,255,255,0.3);">
                <div style="font-size: 36px; color: white;">📧</div>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                New Contact Submission
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">
                EduPath Pro Contact Form
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              
              <!-- Contact Information Card -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 25px; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -10px; right: -10px; width: 40px; height: 40px; background: linear-gradient(45deg, #3b82f6, #8b5cf6); border-radius: 50%; opacity: 0.1;"></div>
                <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                  <span style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; width: 32px; height: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">👤</span>
                  Contact Information
                </h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; width: 30%; vertical-align: top;">
                      <strong style="color: #475569; font-size: 14px;">👤 Name:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 16px; font-weight: 500;">
                      ${name}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; width: 30%; vertical-align: top;">
                      <strong style="color: #475569; font-size: 14px;">📧 Email:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                      <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none; font-weight: 500; font-size: 16px; padding: 6px 12px; background-color: rgba(59, 130, 246, 0.1); border-radius: 6px; display: inline-block;">
                        ${email}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; width: 30%; vertical-align: top;">
                      <strong style="color: #475569; font-size: 14px;">📱 Phone:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 16px;">
                      ${phone || '<span style="color: #94a3b8; font-style: italic;">Not provided</span>'}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; width: 30%; vertical-align: top;">
                      <strong style="color: #475569; font-size: 14px;">📝 Subject:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                      <span style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">
                        ${subject}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; width: 30%; vertical-align: top;">
                      <strong style="color: #475569; font-size: 14px;">🕒 Time:</strong>
                    </td>
                    <td style="padding: 12px 0; color: #64748b; font-size: 15px;">
                      ${new Date(timestamp).toLocaleString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZoneName: 'short'
                      })}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Message Card -->
              <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 25px; position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="position: absolute; top: -5px; left: -5px; width: 30px; height: 30px; background: linear-gradient(45deg, #8b5cf6, #ec4899); border-radius: 50%; opacity: 0.1;"></div>
                <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                  <span style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; width: 32px; height: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">💬</span>
                  Message Content
                </h2>
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                  <p style="color: #374151; line-height: 1.8; margin: 0; font-size: 16px; white-space: pre-wrap;">
                    ${message}
                  </p>
                </div>
              </div>

              <!-- Action Section -->
              <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; text-align: center;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                  🚀 Quick Actions
                </h3>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                  <a href="mailto:${email}?subject=Re: ${subject}" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3); transition: all 0.3s ease;">
                    ↩️ Reply to ${name.split(' ')[0]}
                  </a>
                  ${phone ? `<a href="tel:${phone}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">📞 Call Now</a>` : ''}
                </div>
              </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #1f2937; padding: 25px 30px; border-radius: 0 0 12px 12px; text-align: center;">
              <div style="margin-bottom: 15px;">
                <h3 style="color: white; margin: 0; font-size: 18px; font-weight: 600;">EduPath Pro</h3>
                <p style="color: #9ca3af; margin: 5px 0 0; font-size: 14px;">Empowering Educational Excellence</p>
              </div>
              <div style="border-top: 1px solid #374151; padding-top: 15px; margin-top: 15px;">
                <p style="color: #6b7280; margin: 0; font-size: 12px;">
                  This email was automatically generated from the EduPath Pro contact form.<br>
                  Received on ${new Date(timestamp).toLocaleDateString()} at ${new Date(timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>

          </div>
        </body>
        </html>
      `,
    };

    // Send email
    console.log('📤 Sending email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}