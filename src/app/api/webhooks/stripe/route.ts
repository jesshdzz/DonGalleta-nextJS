import { NextResponse } from "next/server";
import Stripe from "stripe";
import { processSuccessfulPayment } from "@/actions/payment-actions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover", 
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !endpointSecret) return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown Error";
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;    
    await processSuccessfulPayment(paymentIntent.id, paymentIntent.amount, paymentIntent.metadata);
  }

  return NextResponse.json({ received: true });
}