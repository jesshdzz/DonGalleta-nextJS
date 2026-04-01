import { sendLowStockAlert, sendOutOfStockAlert } from '@/lib/email';

export interface StockComparisonData {
  productId: number;
  productName: string;
  oldStock: number;
  newStock: number;
}

export interface StockThresholdResult {
  shouldSendLowStockAlert: boolean;
  shouldSendOutOfStockAlert: boolean;
  crossedLowStockThreshold: boolean;
  crossedOutOfStockThreshold: boolean;
}

/**
 * Analiza si el cambio de stock cruzó algún umbral crítico
 * Implementa la lógica de cruce de umbral:
 * - Bajo stock: oldStock > 5 && newStock <= 5 && newStock > 0
 * - Agotado: oldStock > 0 && newStock === 0
 */
export function analyzeStockThreshold(
  oldStock: number, 
  newStock: number
): StockThresholdResult {
  // Lógica de cruce de umbral (exacta como en las instrucciones)
  const crossedLowStockThreshold = oldStock > 5 && newStock <= 5 && newStock > 0;
  const crossedOutOfStockThreshold = oldStock > 0 && newStock === 0;

  return {
    shouldSendLowStockAlert: crossedLowStockThreshold,
    shouldSendOutOfStockAlert: crossedOutOfStockThreshold,
    crossedLowStockThreshold,
    crossedOutOfStockThreshold,
  };
}

/**
 * Procesa notificaciones de stock para un producto específico
 * Analiza el cambio y envía las notificaciones correspondientes
 */
export async function processStockNotification(data: StockComparisonData) {
  const { productId, productName, oldStock, newStock } = data;
  
  console.log('🔍 Analizando cambio de stock:', {
    productId,
    productName,
    change: `${oldStock} → ${newStock}`,
  });

  // Analizar si se cruzaron umbrales
  const thresholdResult = analyzeStockThreshold(oldStock, newStock);
  
  console.log('📊 Resultado del análisis:', {
    productId,
    thresholdResult,
  });

  const results = {
    lowStockAlert: null as any,
    outOfStockAlert: null as any,
  };

  // Enviar alerta de stock bajo si corresponde
  if (thresholdResult.shouldSendLowStockAlert) {
    console.log('📧 Enviando alerta de stock bajo...');
    
    results.lowStockAlert = await sendLowStockAlert({
      productId,
      productName,
      currentStock: newStock,
    });
  }

  // Enviar alerta de producto agotado si corresponde
  if (thresholdResult.shouldSendOutOfStockAlert) {
    console.log('🚨 Enviando alerta de producto agotado...');
    
    results.outOfStockAlert = await sendOutOfStockAlert({
      productId,
      productName,
      currentStock: newStock,
    });
  }

  // Si no se cruzó ningún umbral
  if (!thresholdResult.shouldSendLowStockAlert && !thresholdResult.shouldSendOutOfStockAlert) {
    console.log('ℹ️ No se cruzaron umbrales críticos, no se envían alertas');
  }

  return {
    thresholdResult,
    emailResults: results,
  };
}

/**
 * Procesa múltiples productos en una transacción
 * Útil cuando varias compras reducen stock de múltiples productos
 */
export async function processMultipleStockNotifications(products: StockComparisonData[]) {
  console.log(`🔄 Procesando ${products.length} productos para notificaciones de stock`);
  
  const results = [];
  
  for (const product of products) {
    try {
      const result = await processStockNotification(product);
      results.push({
        productId: product.productId,
        success: true,
        ...result,
      });
    } catch (error) {
      console.error(`❌ Error procesando notificaciones para producto ${product.productId}:`, error);
      results.push({
        productId: product.productId,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }
  
  // Log resumen
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.length - successCount;
  
  console.log(`✅ Procesamiento completo: ${successCount} exitosos, ${errorCount} errores`);
  
  return results;
}

/**
 * Función de utilidad para testing
 * Permite simular diferentes escenarios de cambio de stock
 */
export function getStockChangeScenario(oldStock: number, newStock: number): string {
  const analysis = analyzeStockThreshold(oldStock, newStock);
  
  if (analysis.crossedOutOfStockThreshold) {
    return 'PRODUCTO_AGOTADO';
  }
  
  if (analysis.crossedLowStockThreshold) {
    return 'STOCK_BAJO';
  }
  
  if (oldStock <= 5 && newStock <= 5) {
    return 'YA_ESTAVA_BAJO';
  }
  
  if (oldStock > 5 && newStock > 5) {
    return 'STOCK_NORMAL';
  }
  
  return 'SIN_CAMBIO_CRITICO';
}