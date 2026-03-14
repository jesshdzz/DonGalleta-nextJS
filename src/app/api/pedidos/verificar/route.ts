import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const intent = body.intent;

    if (!intent) {
      return NextResponse.json({ error: "Falta ID" }, { status: 400 });
    }

    // buscamos la orden
    const order = await prisma.order.findFirst({
      where: { 
        payment: { transactionId: intent }
      },
      include: {
        items: { include: { product: true } }, 
        user: true 
      }
    });
    // si no existe, respondemos con error
    if (!order) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }

    return NextResponse.json(order);
    
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}