"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { createPaymentIntent } from "@/actions/payment-actions";
import { StoreSelector } from "@/components/pago/StoreSelector";

// Inicializo la conexión con Stripe usando mi llave pública
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function PagoPage() {
  // Me traigo el total con descuentos y el carrito completo
  const { discountedPrice, totalPrice, promoDiscount, appliedCoupon, cart } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const router = useRouter();

  // Pido el Client Secret a mi API en cuanto cargo la página y tengo un total válido
  useEffect(() => {
    // Si el carrito está vacío, lo regresamos a la tienda inmediatamente
    if (cart.length === 0) {
      router.replace("/carrito");
    }
  }, [cart, router]);

  useEffect(() => {
    if (discountedPrice > 0 && selectedStoreId) {
      createPaymentIntent(discountedPrice, cart, selectedStoreId, appliedCoupon?.id)
        .then((res) => {
          if (res.success && res.clientSecret) {
            setClientSecret(res.clientSecret);
          } else {
            console.error(res.error);
          }
        })
        .catch((error) => console.error("Me falló la petición del client secret:", error));
    }
  }, [discountedPrice, cart, selectedStoreId, appliedCoupon?.id]);

  // Evitamos renderizar la página si el carrito está vacío
  if (cart.length === 0) return null; 

  return (
    // Reduje el padding vertical en móviles (py-6) y lo mantuve en escritorio (md:py-12)
    <div className="container mx-auto py-6 md:py-12 px-4 min-h-screen flex flex-col items-center bg-background">
      <div className="w-full max-w-5xl mb-4 md:mb-6">
        <Link href="/carrito">
          <Button variant="ghost" size="sm" className="gap-2 pl-0 hover:bg-transparent hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al carrito
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-5xl shadow-xl overflow-hidden border-primary/10">
        <div className="grid md:grid-cols-2 gap-0 flex-col-reverse md:flex-row">
          
          {/* LADO IZQUIERDO: Formulario - Ajuste de paddings para móviles (p-5) y escritorio (md:p-12) */}
          <div className="p-5 sm:p-8 md:p-12 bg-card order-2 md:order-1">
            <CardHeader className="px-0 pt-0">
              {/* Tipografía adaptativa */}
              <CardTitle className="text-2xl md:text-3xl font-serif text-primary">Finaliza tu pedido</CardTitle>
              <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
                Ingresa tus datos de pago de forma segura.
              </p>
            </CardHeader>
            <CardContent className="px-0 space-y-4 md:space-y-6">
              
              <StoreSelector 
                selectedStoreId={selectedStoreId} 
                onStoreSelect={setSelectedStoreId} 
              />
              

              
              {clientSecret ? (
                <div className="border-t border-border pt-6 mt-6">
                  
                  {/* Resumen Mini de Descuentos */}
                  {(promoDiscount > 0 || appliedCoupon) && (
                    <div className="mb-6 bg-secondary/20 p-4 rounded-lg space-y-2 border border-primary/10">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Subtotal:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                      {promoDiscount > 0 && (
                        <div className="flex justify-between text-sm text-amber-600 font-medium">
                          <span>Descuento Promociones:</span>
                          <span>-${promoDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      {appliedCoupon && (
                        <div className="flex justify-between text-sm text-green-600 font-medium">
                          <span>Cupón ({appliedCoupon.code}):</span>
                          <span>-${(totalPrice - discountedPrice - promoDiscount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-primary pt-2 border-t border-primary/10">
                        <span>Total a Pagar:</span>
                        <span>${discountedPrice.toFixed(2)}</span>
                      </div>
                      {appliedCoupon && (
                        <p className="text-xs text-muted-foreground mt-2 text-center border-t border-primary/10 pt-2">
                          💡 Puedes cambiar el cupón en el carrito
                        </p>
                      )}
                    </div>
                  )}

                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <FormularioPago amount={discountedPrice} />
                  </Elements>
                </div>
              ) : selectedStoreId ? (
                <div className="min-h-62.5 md:min-h-75 border-2 border-dashed border-primary/20 rounded-lg flex flex-col items-center justify-center bg-secondary/5 text-muted-foreground p-4 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                  <p className="text-sm md:text-base">Conectando de forma segura...</p>
                </div>
              ) : null}

            </CardContent>
          </div>

          {/* LADO DERECHO: Imagen - Ajuste de espacio y orden visual en móviles */}
          <div className="bg-secondary/20 p-6 sm:p-8 md:p-12 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-l border-primary/5 order-1 md:order-2">
            {/* Escalado responsivo de la imagen: pequeña en celular, grande en PC */}
            <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-80 md:h-80 drop-shadow-2xl hover:scale-105 transition-transform duration-500">
              <Image 
                src={doncookImg} 
                alt="Don Cook - El maestro galletero"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="mt-4 md:mt-8 text-center space-y-1 md:space-y-2">
              <h3 className="text-lg md:text-xl font-serif font-bold text-foreground">¡Casi listas para el horno!</h3>
              <p className="text-xs md:text-sm text-muted-foreground max-w-xs mx-auto px-4 md:px-0">
                Tus galletas están a un paso de llegar a tus manos, calientitas y deliciosas.
              </p>
            </div>
          </div>

        </div>
      </Card>
    </div>
  );
}