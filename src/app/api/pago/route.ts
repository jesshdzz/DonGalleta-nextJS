import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth"; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover", 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, cart } = body; 

    const session = await auth();
    let userId = "";
    
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ 
        where: { email: session.user.email }
      });
      if (user) {
        userId = user.id;
      }
    }

    const itemsSimplificados = cart.map((item: any) => ({
      id: item.productId,
      cantidad: item.quantity,
      precio: item.price 
    }));

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), 
      currency: "mxn", 
      automatic_payment_methods: {
        enabled: true, 
      },
      metadata: {
        userId: userId, 
        productos: JSON.stringify(itemsSimplificados)
      }
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    
  } catch (error: any) {
    console.error("Hubo una bronca al crear el PaymentIntent:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al procesar el pago" },
      { status: 500 }
    );
  }
}