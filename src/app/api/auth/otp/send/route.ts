import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Store OTPs temporarily in memory for verification (in production, use Redis or a database)
export const otpStore = new Map<string, { code: string, expires: number }>();

// Cache the testing account to avoid regenerating it on every request
let testAccount: nodemailer.TestAccount | null = null;

export async function POST(req: Request) {
  try {
    const { method, target } = await req.json();

    if (!method || !target) {
      return NextResponse.json({ error: 'Method and target are required' }, { status: 400 });
    }

    // Generate a random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(target, { code, expires });

    if (method === 'email') {
      let transporter;

      // If you've manually added Gmail env variables, it will use them:
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
      } else {
        // AUTOMATIC TEST MODE: Creates an Ethereal test inbox on the fly!
        if (!testAccount) {
          testAccount = await nodemailer.createTestAccount();
        }
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false, 
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      const info = await transporter.sendMail({
        from: '"Drone Bee Security" <security@dronebee.com>',
        to: target, // Will say it's going to jambopatrick456@gmail.com
        subject: 'Your Drone Bee Password Reset Code',
        text: `Your security code is: ${code}. It expires in 10 minutes.`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2>Drone Bee Authentication</h2>
            </div>
            <p>You requested a password reset. Your secure OTP code is:</p>
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px;">
              <strong>${code}</strong>
            </div>
            <p style="margin-top: 20px; color: #555;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `,
      });

      if (!process.env.EMAIL_PASS) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`\n\n🟢 ===================================== 🟢`);
        console.log(`✅ [SUCCESS! REAL EMAIL SIMULATED] ✅`);
        console.log(`Open this exact link in your browser to view the email:`);
        console.log(`🔗 -> ${previewUrl} <- 🔗`);
        console.log(`🟢 ===================================== 🟢\n\n`);
      }

      return NextResponse.json({ success: true, message: 'OTP sent to email.' });
    }

    if (method === 'phone') {
      // SMS sending requires an external provider API (like Twilio, Infobip, etc.).
      const previewUrl = `SMS is not fully mocked via Ethereal. Code is: ${code}`;
      console.log(`\n\n🟢 ===================================== 🟢`);
      console.log(`📱 [SUCCESS! SMS SIMULATED to ${target}] 📱`);
      console.log(`💬 Code: ${code}`);
      console.log(`🟢 ===================================== 🟢\n\n`);
      return NextResponse.json({ success: true, message: 'OTP sent to phone.' });
    }

    return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Failed to send OTP.' }, { status: 500 });
  }
}