"use client";

import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ShoppingBag, Ticket, X, Loader2 } from "lucide-react";
import { CartItemRow } from "@/components/carro/CartItemRow";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { validateCoupon } from "@/actions/coupon-actions";

export default function CartPage() {
  const router = useRouter();
  const { status } = useSession();

  const {
    cart, clearCart, totalItems, totalPrice,
    discountedPrice, appliedCoupon, applyCoupon, refreshCartStock
  } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

  const handleCheckout = async () => {
    if (status === "unauthenticated") {
      toast.error("Necesitas iniciar sesión", { description: "Para poder rastrear tus galletas en tiempo real, primero entra a tu cuenta." });
      router.push("/auth/login");
      return;
    }

    setIsLoading(true);

    // VALIDACIÓN CRÍTICA ANTES DE IR A STRIPE
    const freshCart = await refreshCartStock();
    const hasInvalidItems = freshCart.some(i => i.availableQuantity === 0 || i.quantity > i.availableQuantity);

    if (hasInvalidItems) {
      toast.error("¡Alto ahí!", { description: "Algunos productos de tu carrito se agotaron o no tienen stock suficiente. Ajusta las cantidades." });
      setIsLoading(false);
      return;
    }

    if (totalItems === 0) {
      toast.error("Tu carrito válido está vacío.");
      setIsLoading(false);
      return;
    }

    router.push("/pago");
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsCheckingCoupon(true);
    const res = await validateCoupon(couponCode);
    if (res.success && res.coupon) {
      applyCoupon(res.coupon);
      setCouponCode("");
      toast.success("¡Cupón aplicado correctamente!");
    } else {
      toast.error(res.error || "Cupón inválido");
    }
    setIsCheckingCoupon(false);
  };

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

  // Buscamos productos inválidos (0 stock o pidiendo de más)
  const hasInvalid = cart.some(i => i.availableQuantity === 0 || i.quantity > i.availableQuantity);

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
        Tu Carrito <span className="text-xl font-sans font-normal text-muted-foreground">({cart.length} productos)</span>
      </h1>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

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
              onClick={() => clearCart()}
            >
              Vaciar Carrito
            </Button>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-24">
            <Card className="bg-card shadow-xl border-primary/10 overflow-hidden">
              <div className="bg-secondary/30 p-6 border-b border-primary/5">
                <CardTitle className="text-2xl font-serif text-primary">Resumen del Pedido</CardTitle>
              </div>
              <CardContent className="space-y-4 p-6">

                {totalItems > 0 ? (
                  <>
                    <div className="flex justify-between text-base">
                      <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                      <span className="font-medium">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-muted-foreground">Envío</span>
                      <span className="text-green-600 font-bold">Gratis</span>
                    </div>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200 mt-4">
                        <div>
                          <span className="block text-sm font-bold text-green-700">Cupón: {appliedCoupon.code}</span>
                          <span className="block text-xs text-green-600">
                            Descuento: -${(totalPrice - discountedPrice).toFixed(2)}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => applyCoupon(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-4">
                        <Input
                          placeholder="Código de cupón"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          className="uppercase"
                        />
                        <Button
                          variant="secondary"
                          onClick={handleApplyCoupon}
                          disabled={isCheckingCoupon || !couponCode}
                        >
                          {isCheckingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
                        </Button>
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-foreground">Total</span>
                      <span className="text-3xl font-bold text-primary">${discountedPrice.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay productos disponibles para cobrar.
                  </div>
                )}

                {hasInvalid && (
                  <p className="text-xs font-semibold text-destructive bg-destructive/10 p-3 rounded flex flex-col gap-1 mt-2">
                    <span>⚠️ Tienes productos inválidos en tu carrito.</span>
                    <span className="font-normal">Reduce la cantidad o elimínalos para continuar.</span>
                  </p>
                )}

              </CardContent>

              <CardFooter className="flex flex-col gap-4 p-6 pt-0">
                <Button
                  className="w-full text-lg font-bold h-14 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  onClick={handleCheckout}
                  disabled={isLoading || totalItems === 0 || hasInvalid}
                >
                  {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Procesando...</> : 'Proceder al Pago'}
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