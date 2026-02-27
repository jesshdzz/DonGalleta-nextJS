"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";

// Imagen
import doncookImg from "@/assets/images/doncook.png"; 
import { FormularioPago } from "@/components/pago/Formulario";

// Inicializo la conexión con Stripe usando mi llave pública
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function PagoPage() {
  // Me traigo el total y también el carrito completo para poder mandarlo a la API
  const { totalPrice, cart } = useCart();
  const [clientSecret, setClientSecret] = useState("");

  // Pido el Client Secret a mi API en cuanto cargo la página y tengo un total válido
  useEffect(() => {
    if (totalPrice > 0) {
      fetch("/api/pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Le mando a mi backend tanto lo que voy a cobrar como los productos (para la metadata)
        body: JSON.stringify({ amount: totalPrice, cart: cart }),
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => console.error("Me falló la petición del client secret:", error));
    }
  }, [totalPrice, cart]); // Agregué cart aquí para que reaccione si cambia

  return (
    <div className="container mx-auto py-12 px-4 min-h-screen flex flex-col items-center bg-background">
      <div className="w-full max-w-5xl mb-6">
        <Link href="/carrito">
          <Button variant="ghost" size="sm" className="gap-2 pl-0 hover:bg-transparent hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al carrito
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-5xl shadow-xl overflow-hidden border-primary/10">
        <div className="grid md:grid-cols-2 gap-0">
          
          <div className="p-8 md:p-12 bg-card">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-3xl font-serif text-primary">Finaliza tu pedido</CardTitle>
              <p className="text-muted-foreground mt-2">
                Ingresa tus datos de pago de forma segura.
              </p>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <FormularioPago amount={totalPrice} />
                </Elements>
              ) : (
                <div className="min-h-[300px] border-2 border-dashed border-primary/20 rounded-lg flex flex-col items-center justify-center bg-secondary/5 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                  <p>Conectando de forma segura...</p>
                </div>
              )}

            </CardContent>
          </div>

          <div className="bg-secondary/20 p-8 md:p-12 flex flex-col items-center justify-center relative border-l border-primary/5">
            <div className="relative w-64 h-64 md:w-80 md:h-80 drop-shadow-2xl hover:scale-105 transition-transform duration-500">
              <Image 
                src={doncookImg} 
                alt="Don Cook - El maestro galletero"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="mt-8 text-center space-y-2">
              <h3 className="text-xl font-serif font-bold text-foreground">¡Casi listas para el horno!</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Tus galletas están a un paso de llegar a tus manos, calientitas y deliciosas.
              </p>
            </div>
          </div>

        </div>
      </Card>
    </div>
  );
}