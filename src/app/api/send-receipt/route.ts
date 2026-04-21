import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendReceiptEmail, type ReceiptData } from '@/lib/email';

// Schema de validación con Zod
const receiptSchema = z.object({
  orderNumber: z.string().min(1, 'Número de orden requerido'),
  customerName: z.string().optional(),
  customerEmail: z.string().email('Formato de email inválido'),
  items: z.array(
    z.object({
      quantity: z.number().positive('Cantidad debe ser positiva'),
      name: z.string().min(1, 'Nombre de producto requerido'),
      price: z.number().nonnegative('Precio no puede ser negativo'),
    })
  ).min(1, 'Debe incluir al menos un producto'),
  total: z.number().positive('Total debe ser mayor a 0'),
  date: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos con Zod
    const validationResult = receiptSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: z.ZodIssue) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: errors 
        },
        { status: 400 }
      );
    }

    const { orderNumber, customerName, customerEmail, items, total, date } = validationResult.data;

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
      total,
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