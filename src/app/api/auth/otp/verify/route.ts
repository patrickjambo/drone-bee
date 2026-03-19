import { NextResponse } from 'next/server';
import { otpStore } from '../send/route';

export async function POST(req: Request) {
  try {
    const { target, code } = await req.json();

    if (!target || !code) {
      return NextResponse.json({ error: 'Target and code are required' }, { status: 400 });
    }

    const record = otpStore.get(target);

    if (!record) {
      return NextResponse.json({ error: 'No OTP found or it has expired. Please request a new one.' }, { status: 400 });
    }

    if (Date.now() > record.expires) {
      otpStore.delete(target);
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    if (record.code === code) {
      // OTP matched and valid
      otpStore.delete(target); // clear it after successful use
      return NextResponse.json({ success: true, message: 'OTP verified successfully' });
    }

    return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
