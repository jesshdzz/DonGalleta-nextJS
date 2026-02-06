"use client";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingBag, CheckCircle2 } from "lucide-react";
import { CartItemRow } from "@/components/carro/CartItemRow";
import { toast } from "sonner";

export default function CartPage() {
  const {
    cart,
    clearCart,
    totalItems,
    totalPrice,
    checkout
  } = useCart();

  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const success = await checkout();
      if (success) {
        setIsCheckoutSuccess(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión. Verifica tu red.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- ESTADO: COMPRA EXITOSA ---
  if (isCheckoutSuccess) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 border-primary/20 bg-secondary/10 shadow-lg">
          <CardContent className="space-y-6 pt-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-serif font-bold text-primary">¡Gracias por tu compra!</h2>
              <p className="text-muted-foreground">
                Tu pedido ha sido procesado correctamente. ¡Disfruta tus galletas!
              </p>
            </div>
            <Link href="/productos">
              <Button className="w-full mt-4 font-bold" size="lg">Volver a la Tienda</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- ESTADO: CARRITO VACÍO ---
  if (cart.length === 0) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-4 text-center space-y-8 animate-in fade-in duration-500">
        <div className="w-40 h-40 bg-secondary/30 rounded-full flex items-center justify-center shadow-inner">
          <ShoppingBag className="w-20 h-20 text-muted-foreground/50" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-serif font-bold text-primary">Tu carrito está vacío</h2>
          <p className="text-muted-foreground max-w-sm mx-auto text-lg">
            ¿Aún no te decides? Tenemos las mejores galletas horneadas esperando por ti.
          </p>
        </div>
        <Link href="/productos">
          <Button size="lg" className="font-bold text-lg px-8 py-6 shadow-md hover:shadow-lg transition-all">Explorar Productos</Button>
        </Link>
      </div>
    );
  }

  // --- ESTADO: CARRITO CON PRODUCTOS ---
  return (
    <div className="container mx-auto py-12 px-4 min-h-screen">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/productos">
          <Button variant="ghost" size="sm" className="gap-2 pl-0 hover:bg-transparent hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Seguir comprando
          </Button>
        </Link>
      </div>

      <h1 className="text-4xl font-serif font-bold text-primary mb-8 flex items-center gap-3">
        Tu Carrito <span className="text-xl font-sans font-normal text-muted-foreground">({totalItems} productos)</span>
      </h1>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

        {/* COLUMNA IZQUIERDA: LISTA DE ITEMS (Ocupa 8/12 columnas) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-4">
            {cart.map((item) => (
              <CartItemRow key={item.productId} item={item} />
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              className="text-muted-foreground border-destructive/30 hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={clearCart}
            >
              Vaciar Carrito
            </Button>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN (Ocupa 4/12 columnas) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            <Card className="bg-card shadow-xl border-primary/10 overflow-hidden">
              <div className="bg-secondary/30 p-6 border-b border-primary/5">
                <CardTitle className="text-2xl font-serif text-primary">Resumen del Pedido</CardTitle>
              </div>
              <CardContent className="space-y-4 p-6">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-green-600 font-bold">Gratis</span>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-foreground">Total</span>
                  <span className="text-3xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 p-6 pt-0">
                <Button
                  className="w-full text-lg font-bold h-14 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  onClick={handleCheckout}
                  disabled={isLoading}
                >
                  {isLoading ? 'Procesando...' : 'Proceder al Pago'}
                </Button>
                <div className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
                  🔒 Pagos seguros y encriptados
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}