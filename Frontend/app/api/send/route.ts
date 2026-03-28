import * as React from 'react';
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { EmailTemplate } from '@/components/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, verificationToken } = await request.json();

    if (!email || !firstName || !verificationToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'FruiTaste <no-reply@fruitaste.page>',
      to: [email],
      subject: 'Xác thực Email - FruiTaste',
      react: EmailTemplate({ firstName, verificationToken }) as React.ReactElement,
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Catch Error sending email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
