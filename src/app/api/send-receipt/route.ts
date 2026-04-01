import { NextRequest, NextResponse } from 'next/server';
import { sendReceiptEmail, type ReceiptData } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos requeridos
    const { orderNumber, customerName, customerEmail, items, total, date } = body;
    
    if (!orderNumber || !customerEmail || !items || !total) {
      return NextResponse.json(
        { error: 'Datos faltantes: orderNumber, customerEmail, items y total son requeridos' },
        { status: 400 }
      );
    }

    // Validar email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Verificar RESEND_API_KEY
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Servicio de email no configurado' },
        { status: 500 }
      );
    }

    const receiptData: ReceiptData = {
      orderNumber,
      customerName: customerName || 'Cliente',
      customerEmail,
      items,
      total: Number(total),
      date: date || new Date().toLocaleDateString('es-MX'),
    };

    const result = await sendReceiptEmail(receiptData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Comprobante enviado exitosamente',
        emailId: result.emailId,
      });
    } else {
      throw new Error('Error enviando email');
    }
  } catch (error) {
    console.error('Error en API send-receipt:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}