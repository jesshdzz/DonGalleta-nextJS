import { NextResponse } from "next/server";
import Stripe from "stripe";

// Configuro mi instancia de Stripe asegurándome de usar mi llave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover", 
});

// Esta ruta genera la intención de cobro y le pega la info de los productos
export async function POST(request: Request) {
  try {
    // Saco el monto y el carrito que me acaba de mandar mi frontend
    const body = await request.json();
    const { amount, cart } = body; 

    // Reduzco los datos del carrito porque Stripe tiene un límite en la metadata
    // Solo me interesa guardar qué galleta (id) compraron y cuántas (cantidad)
    const itemsSimplificados = cart.map((item: any) => ({
      id: item.productId,
      cantidad: item.quantity
    }));

    // Le digo a Stripe que me cree un cobro por esta cantidad
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Lo multiplico por 100 porque Stripe usa centavos
      currency: "mxn", 
      automatic_payment_methods: {
        enabled: true, 
      },
      // Aquí le pego mi "post-it" (metadata) convirtiendo mi arreglo a texto
      metadata: {
        productos: JSON.stringify(itemsSimplificados)
      }
    });

    // Le regreso la llave temporal al cliente para que pinte la cajita de la tarjeta
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    
  } catch (error: any) {
    console.error("Hubo una bronca al crear el PaymentIntent:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al procesar el pago" },
      { status: 500 }
    );
  }
}