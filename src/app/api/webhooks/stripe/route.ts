import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { z } from "zod"; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover", 
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const CarritoMetadataSchema = z.array(
  z.object({
    id: z.number().int().positive(),
    cantidad: z.number().int().positive(),
    precio: z.number().positive()
  })
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !endpointSecret) return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;    
    
    const productosCompradosString = paymentIntent.metadata.productos;
    const userId = paymentIntent.metadata.userId; 

    if (productosCompradosString && userId) {
      try {
        const parsedData = JSON.parse(productosCompradosString);
        const productosValidados = CarritoMetadataSchema.parse(parsedData);
        
        await prisma.$transaction(async (tx) => {
          await tx.order.create({
            data: {
              userId: userId,
              total: paymentIntent.amount / 100,
              status: "PENDING", 
              items: {
                create: productosValidados.map((item) => ({
                  productId: item.id,
                  quantity: item.cantidad,
                  price: item.precio
                }))
              },
              payment: {
                create: {
                  method: "STRIPE",
                  transactionId: paymentIntent.id, 
                  amount: paymentIntent.amount / 100,
                  status: "paid"
                }
              }
            }
          });

          for (const item of productosValidados) {
            await tx.product.update({
              where: { id: item.id },
              data: { stock: { decrement: item.cantidad } }
            });
          }
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Error de Zod:", error.issues);
        } else {
          console.error("Error crítico en BD:", error);
        }
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}