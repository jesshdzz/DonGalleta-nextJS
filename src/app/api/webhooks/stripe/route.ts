import { NextResponse } from "next/server";
import Stripe from "stripe";
// Me traigo mi conexión a la base de datos de MariaDB con Prisma
// OJO: Ajusta esta ruta dependiendo de dónde guardaste tu archivo de conexión
import { prisma } from "@/lib/prisma"; 

// Vuelvo a instanciar Stripe y saco la llave secreta especial de mi Webhook
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover", 
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Aquí mi servidor se queda escuchando los avisos que me manda Stripe por detrás
export async function POST(req: Request) {
  // Necesito leer el texto crudo para que Stripe pueda validar su firma criptográfica
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !endpointSecret) {
    return NextResponse.json(
      { error: "Me faltan credenciales del webhook" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Esto verifica que el aviso realmente venga de Stripe y no de alguien intentando hackear
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`❌ Chin, error de firma en mi Webhook: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Me enfoco solo en los eventos donde el cliente sí pudo pagar
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    console.log(`✅ ¡Pago exitoso verificado por mi servidor! Monto: ${paymentIntent.amount}`);
    
    // Despego el "post-it" (metadata) que le puse en la otra API para saber qué descontar
    const productosCompradosString = paymentIntent.metadata.productos;

    if (productosCompradosString) {
      // Convierto el texto de vuelta a un arreglo para poder leerlo en JS
      const productos = JSON.parse(productosCompradosString);
      console.log("🛒 Productos listos para descontarse de mi DB:", productos);

      try {
        // Hago un ciclo para pasar por cada galleta que compraron
        for (const item of productos) {
          
          // Le digo a mi base de datos de MariaDB que busque la galleta por su ID 
          // y le reste la cantidad exacta que compraron a mi columna de stock.
          // OJO: Si en tu modelo de Prisma la tabla no se llama 'producto' o la columna no es 'stock', cámbialo aquí.
          await prisma.product.update({
            where: { 
              id: item.id 
            },
            data: { 
              stock: { 
                decrement: item.cantidad // decrement le resta automáticamente de forma segura
              } 
            }
          });

          console.log(`✅ ¡Listo! Se descontaron ${item.cantidad} unidades de la galleta con ID ${item.id}`);
        }
      } catch (dbError) {
        // Si MariaDB falla (ej. se cae la conexión), lo registro aquí.
        // OJO: Stripe ya cobró, así que esto es grave. Aquí en un futuro 
        // podría programar que me mande un correo o un mensaje de WhatsApp automático para arreglarlo.
        console.error("🚨 ¡Alerta! El cobro pasó pero falló mi base de datos al descontar:", dbError);
      }
    }
  }

  // Siempre le respondo con un 200 a Stripe rápido, para que sepan que recibí su mensaje
  return NextResponse.json({ received: true });
}