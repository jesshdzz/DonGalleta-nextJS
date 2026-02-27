"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Home, FileText, MessageCircle, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

function EstadoDelPago() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");
  
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  
  // Usamos una referencia para saber si ya vaciamos el carrito y evitar el bucle infinito
  const yaProcesado = useRef(false);

  useEffect(() => {
    // Si ya procesamos esta compra, no hacemos nada más
    if (yaProcesado.current) return;

    if (!paymentIntent) {
      setStatus("error");
      return;
    }

    if (redirectStatus === "succeeded") {
      setStatus("success");
      clearCart(); // Vaciamos el carrito
      yaProcesado.current = true; // Marcamos como procesado
    } else {
      setStatus("error");
      yaProcesado.current = true;
    }
  }, [paymentIntent, redirectStatus, clearCart]);

  // Funciones placeholder para el futuro
  const descargarPDF = () => toast.info("Función de PDF en desarrollo 🚀");
  const enviarWhatsApp = () => toast.info("Función de WhatsApp en desarrollo 🚀");

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground text-lg">Verificando tu pago...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">❌</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold text-red-600">Algo salió mal</h2>
          <p className="text-muted-foreground">No pudimos procesar tu pago. Por favor, intenta nuevamente.</p>
        </div>
        <Link href="/pago">
          <Button size="lg" className="mt-4 font-bold">Volver a intentar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center space-y-8">
      <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500 shadow-sm">
        <CheckCircle2 className="w-14 h-14 text-green-600" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-4xl font-serif font-bold text-primary">¡Pago Exitoso!</h2>
        <p className="text-muted-foreground text-lg">
          Tu pedido está confirmado. ¡Pronto disfrutarás de tus galletas!
        </p>
        <div className="bg-secondary/20 inline-block px-4 py-2 rounded-lg mt-2 border border-primary/10">
          <p className="text-sm font-mono text-muted-foreground">
            Ticket de compra: <span className="font-bold text-foreground">{paymentIntent?.slice(0, 14)}...</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4">
        <Button 
          variant="outline" 
          className="gap-2 h-12 border-primary/20 hover:bg-primary/5"
          onClick={descargarPDF}
        >
          <FileText className="w-5 h-5" />
          Guardar PDF
        </Button>
        
        <Button 
          variant="outline" 
          className="gap-2 h-12 border-green-200 hover:bg-green-50 hover:text-green-700 text-green-600"
          onClick={enviarWhatsApp}
        >
          <MessageCircle className="w-5 h-5" />
          Enviar por WhatsApp
        </Button>
      </div>

      <div className="pt-6 border-t border-border">
        <Link href="/">
          <Button size="lg" className="font-bold gap-2 w-full sm:w-auto px-8">
            <Home className="w-5 h-5" /> Volver al Inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function PagoExitosoPage() {
  return (
    <div className="container mx-auto py-12 px-4 min-h-[80vh] flex items-center justify-center bg-background/50">
      <Card className="max-w-xl w-full shadow-2xl border-primary/10 bg-card">
        <CardContent className="p-8 md:p-12">
          <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />}>
            <EstadoDelPago />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}