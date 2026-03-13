// Webhook de Stripe para procesar pagos exitosos
// Actualiza el inventario de productos cuando se realiza un pago exitoso

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { processMultipleStockNotifications } from "@/lib/stock-notifications"; 

// Inicializa el cliente de Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover", 
});

// Clave secreta del webhook de Stripe para validar peticiones
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Schema de validación para los productos en el carrito
// Valida que cada producto tenga un ID y una cantidad válida
const CarritoMetadataSchema = z.array(
  z.object({
    id: z.number().int().positive("El ID debe ser un número positivo"),
    cantidad: z.number().int().positive("La cantidad debe ser mayor a 0"),
  })
);

// Endpoint POST que recibe y procesa eventos del webhook de Stripe
// Maneja el evento de pago exitoso y actualiza el inventario de productos
export async function POST(req: Request) {
  // Obtiene el cuerpo de la solicitud como texto
  const body = await req.text();
  
  // Extrae la firma de Stripe del header de la solicitud para validación
  const sig = req.headers.get("stripe-signature");

  // Valida que existan las credenciales necesarias del webhook
  if (!sig || !endpointSecret) {
    return NextResponse.json(
      { error: "Me faltan credenciales del webhook" },
      { status: 400 }
    );
  }

  // Declara variable para almacenar el evento de Stripe
  let event: Stripe.Event;

  try {
    // Construye y valida el evento usando la firma de Stripe
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    // Retorna error si la firma no es válida
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Verifica si el evento es un pago exitoso
  if (event.type === "payment_intent.succeeded") {
    // Extrae los datos del pago de la solicitud
    const paymentIntent = event.data.object as Stripe.PaymentIntent;    
    
    // Obtiene la string con los productos comprados desde los metadatos del pago
    const productosCompradosString = paymentIntent.metadata.productos;

    // Procesa el inventario si existen productos en el pago
    if (productosCompradosString) {
      try {
        // Parsea el string JSON de productos a un objeto
        const parsedData = JSON.parse(productosCompradosString);
        
        // Valida que los datos del carrito cumplan con el schema definido
        const productosValidados = CarritoMetadataSchema.parse(parsedData);
        
        // 1. Obtener stock actual y nombres de productos ANTES de actualizar
        const productInfoPromises = productosValidados.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.id },
            select: { stock: true, name: true }
          });
          
          if (!product) {
            throw new Error(`Producto ${item.id} no encontrado`);
          }
          
          return {
            id: item.id,
            name: product.name,
            oldStock: product.stock,
            quantity: item.cantidad,
            // Calcular nuevo stock (lo que quedará después de la compra)
            newStock: Math.max(0, product.stock - item.cantidad)
          };
        });
        
        const productsInfo = await Promise.all(productInfoPromises);
        
        // 2. Prepara las actualizaciones de stock para cada producto comprado
        const updates = productosValidados.map((item) => 
          prisma.product.update({
            where: { id: item.id },
            data: { stock: { decrement: item.cantidad } }  // Disminuye el stock en la cantidad comprada
          })
        );

        // 3. Ejecuta todas las actualizaciones en una transacción de base de datos
        // Garantiza que todas se ejecuten juntas o ninguna
        await prisma.$transaction(updates);
        
        // 4. Procesar notificaciones de stock DESPUÉS de actualización exitosa
        const stockNotificationData = productsInfo.map(product => ({
          productId: product.id,
          productName: product.name,
          oldStock: product.oldStock,
          newStock: product.newStock,
        }));
        
        // Enviar notificaciones sin bloquear la respuesta del webhook
        // Las notificaciones se procesan de forma asíncrona
        processMultipleStockNotifications(stockNotificationData)
          .catch(error => {
            console.error('❌ Error procesando notificaciones de stock:', error);
          });
      } catch (error) {
        // Captura errores de validación del schema
        if (error instanceof z.ZodError) {
          // Los errores de validación se ignoran silenciosamente
        } else {
          // Registra otros tipos de errores desconocidos
          console.log("Error desconocido al actualizar la orden:", error);
        }
        return NextResponse.json({ error: "Error interno actualizando la orden" }, { status: 500 });
      }
    }
  }

  // Retorna confirmación de que el webhook fue procesado exitosamente
  return NextResponse.json({ received: true });
}