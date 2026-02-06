"use client";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, CheckCircle2 } from "lucide-react";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    checkout
  } = useCart();
  
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const success = await checkout();
      if (success) {
        setIsCheckoutSuccess(true);
      } else {
        setErrorMessage("Hubo un problema al procesar tu compra. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Error de conexión. Verifica tu red.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- ESTADO: COMPRA EXITOSA ---
  if (isCheckoutSuccess) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 border-primary/20 bg-secondary/10">
          <CardContent className="space-y-6 pt-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-primary">¡Gracias por tu compra!</h2>
              <p className="text-muted-foreground">
                Tu pedido ha sido procesado correctamente y pronto disfrutarás tus galletas.
              </p>
            </div>
            <Link href="/bodega/productos">
              <Button className="w-full mt-4" size="lg">Volver a la Tienda</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- ESTADO: CARRITO VACÍO ---
  if (cart.length === 0) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-4 text-center space-y-6">
        <div className="w-32 h-32 bg-secondary/30 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/50" />
        </div>
        <h2 className="text-3xl font-bold text-primary">Tu carrito está vacío</h2>
        <p className="text-muted-foreground max-w-sm">
          ¿Aún no te decides? Tenemos las mejores galletas esperando por ti.
        </p>
        <Link href="/productos">
          <Button size="lg">Explorar Productos</Button>
        </Link>
      </div>
    );
  }

  // --- ESTADO: CARRITO CON PRODUCTOS ---
  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/bodega/productos">
          <Button variant="ghost" size="sm" className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Seguir comprando
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-primary mb-8 flex items-center gap-3">
        Tu Carrito <span className="text-lg font-normal text-muted-foreground">({totalItems} productos)</span>
      </h1>

      {errorMessage && (
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <span>⚠️</span> {errorMessage}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: LISTA DE ITEMS (Ocupa 8/12 columnas) */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => (
            <Card key={item.productId} className="flex flex-col sm:flex-row overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-shadow">
              
              {/* Imagen del Item */}
              <div className="relative w-full sm:w-40 h-40 sm:h-auto bg-secondary/20">
                <Image
                  src={item.image_url || "/placeholder-product.jpg"}
                  alt={item.name}
                  className="object-cover"
                  fill
                  sizes="(max-width: 640px) 100vw, 160px"
                />
              </div>

              {/* Detalles */}
              <div className="grow p-4 sm:p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Disponible: {item.availableQuantity}</p>
                  </div>
                  <p className="text-xl font-bold text-primary">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <div className="flex justify-between items-end mt-4">
                  {/* Controles de Cantidad */}
                  <div className="flex items-center border rounded-md bg-background">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-none text-muted-foreground hover:text-primary"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-none text-muted-foreground hover:text-primary"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.availableQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Botón Eliminar */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
                    onClick={() => removeFromCart(item.productId)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          <div className="flex justify-end pt-4">
             <Button variant="outline" className="text-muted-foreground border-destructive/30 hover:bg-destructive/10 hover:text-destructive" onClick={clearCart}>
               Vaciar Carrito
             </Button>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN (Ocupa 4/12 columnas) */}
        <div className="lg:col-span-4">
          <Card className="sticky top-24 bg-card shadow-lg border-primary/10">
            <CardHeader className="bg-secondary/30 pb-4">
              <CardTitle className="text-xl text-primary">Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span className="text-green-600 font-medium">Gratis</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-3 pb-6">
              <Button 
                className="w-full text-lg h-12 shadow-md hover:shadow-lg transition-all" 
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : 'Proceder al Pago'}
              </Button>
              <div className="text-xs text-center text-muted-foreground">
                Pagos seguros procesados por Stripe/PayPal
              </div>
            </CardFooter>
          </Card>
        </div>

      </div>
    </div>
  );
}