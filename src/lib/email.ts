import { Resend } from 'resend';
import LowStockEmail from '../emails/LowStockEmail';
import OutOfStockEmail from '../emails/OutOfStockEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

interface StockAlertData {
  productId: number;
  productName: string;
  currentStock: number;
}

/**
 * Envía notificación de bajo stock (stock <= 5 pero > 0)
 */
export async function sendLowStockAlert(data: StockAlertData) {
  try {
    const result = await resend.emails.send({
      from: 'DonGalleta <onboarding@resend.dev>',
      to: ['locg030916@gs.utm.mx'],
      subject: `⚠️ Stock Bajo - ${data.productName}`,
      react: LowStockEmail({ 
        productId: data.productId,
        productName: data.productName,
        currentStock: data.currentStock 
      }),
    });

    console.log('✅ Email de stock bajo enviado:', {
      productId: data.productId,
      productName: data.productName,
      currentStock: data.currentStock,
      emailId: result.data?.id
    });

    return { success: true, emailId: result.data?.id };
  } catch (error) {
    console.error('❌ Error enviando email de stock bajo:', {
      productId: data.productId,
      error: error instanceof Error ? error.message : error
    });
    
    return { success: false, error };
  }
}

/**
 * Envía notificación de producto agotado (stock = 0)
 */
export async function sendOutOfStockAlert(data: StockAlertData) {
  try {
    const result = await resend.emails.send({
      from: 'DonGalleta <onboarding@resend.dev>',
      to: ['locg030916@gs.utm.mx'],
      subject: `🚨 AGOTADO - ${data.productName}`,
      react: OutOfStockEmail({ 
        productId: data.productId,
        productName: data.productName 
      }),
    });

    console.log('✅ Email de producto agotado enviado:', {
      productId: data.productId,
      productName: data.productName,
      emailId: result.data?.id
    });

    return { success: true, emailId: result.data?.id };
  } catch (error) {
    console.error('❌ Error enviando email de producto agotado:', {
      productId: data.productId,
      error: error instanceof Error ? error.message : error
    });
    
    return { success: false, error };
  }
}