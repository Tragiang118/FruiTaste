import * as React from 'react';
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { OrderInvoiceEmail } from '@/components/order-invoice-email';

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { email, firstName, order } = await request.json();

    if (!email || !order) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'FruiTaste <no-reply@fruitaste.page>',
      to: [email],
      subject: `🍏 Xác nhận đơn hàng #${order.id} - FruiTaste`,
      react: React.createElement(OrderInvoiceEmail, {
        firstName: firstName || 'Khách hàng',
        orderId: order.id,
        createdAt: order.createdAt,
        shippingName: order.shippingName,
        shippingPhone: order.shippingPhone,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.payment?.method || 'COD',
        items: order.items || [],
        totalAmount: order.totalAmount,
        shippingFee: order.shippingFee,
        finalAmount: order.finalAmount,
      }),
    });

    if (error) {
      console.error('[send-invoice] Resend error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[send-invoice] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
