"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Home, FileText, MessageCircle, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

import logoImg from "@/assets/images/logo.png";

function EstadoDelPago() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");
  
  const { cart, totalPrice, clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  
  const [ticketData, setTicketData] = useState<{items: any[], total: number} | null>(null);
  const yaProcesado = useRef(false);

  useEffect(() => {
    if (yaProcesado.current) return;

    if (!paymentIntent) {
      setStatus("error");
      return;
    }

    if (redirectStatus === "succeeded") {
      setStatus("success");
      setTicketData({ items: [...cart], total: totalPrice });
      
      clearCart(); 
      yaProcesado.current = true;
    } else {
      setStatus("error");
      yaProcesado.current = true;
    }
  }, [paymentIntent, redirectStatus, clearCart, cart, totalPrice]);

  const descargarPDF = () => {
    const element = document.getElementById("ticket-compra");
    if (!element) return;
    
    import("html2pdf.js").then((html2pdf) => {
      const opt = {
        margin:       0.5,
        filename:     `ticket-dongalleta-${paymentIntent?.slice(0, 8)}.pdf`,
        image:        { type: 'png' as const, quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };
      toast.success("Generando PDF...");
      html2pdf.default().set(opt).from(element).save();
    });
  };

  const enviarWhatsApp = () => toast.info("Función de WhatsApp en desarrollo");

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
      <div className="text-center space-y-6 flex flex-col items-center justify-center w-full">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
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
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
      
      <div className="order-1 flex flex-col items-center md:items-start text-center md:text-left space-y-6 w-full">
        
        <div className="flex flex-col items-center md:items-start space-y-4 w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-serif font-bold text-primary">¡Pago Exitoso!</h2>
            <p className="text-muted-foreground text-lg">
              Tu pedido está confirmado. ¡Pronto disfrutarás de tus galletas!
            </p>
          </div>
        </div>

        <div 
          id="ticket-compra" 
          className="w-full bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 shadow-sm relative overflow-hidden"
        >
          {/* Marca de agua */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Image src={logoImg} alt="Watermark" width={200} height={200} />
          </div>

          <h3 className="text-xl font-bold border-b pb-2 mb-4 flex justify-between items-center relative z-10">
            <span>Ticket de Compra</span>
            <span className="text-xs font-mono font-normal text-muted-foreground uppercase">
              REF: {paymentIntent?.slice(0, 10)}
            </span>
          </h3>
          
          <div className="space-y-3 font-mono text-sm relative z-10">
            {ticketData?.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="truncate pr-4">{item.quantity}x {item.name}</span>
                <span className="font-semibold whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            
            <div className="flex justify-between items-center pt-2 text-base font-bold text-primary">
              <span>TOTAL PAGADO</span>
              <span>${ticketData?.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-2">
          <Button 
            variant="outline" 
            className="gap-2 h-12 border-primary/20 hover:bg-primary/5"
            onClick={descargarPDF}
          >
            <FileText className="w-5 h-5" />
            Descargar PDF
          </Button>
          
          <Button 
            variant="outline" 
            className="gap-2 h-12 border-green-200 hover:bg-green-50 hover:text-green-700 text-green-600"
            onClick={enviarWhatsApp}
          >
            <MessageCircle className="w-5 h-5" />
            Vía WhatsApp
          </Button>
        </div>

        <div className="pt-2 w-full">
          <Link href="/">
            <Button size="lg" className="font-bold gap-2 w-full">
              <Home className="w-5 h-5" /> Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>

      <div className="order-2 flex flex-col items-center justify-center bg-secondary/10 rounded-2xl p-8 md:p-12 border border-primary/5 h-full min-h-[300px]">
        <div className="relative w-48 h-48 md:w-64 md:h-64 drop-shadow-2xl hover:scale-105 transition-transform duration-500">
          <Image 
            src={logoImg} 
            alt="Don Galleta - Horneadas con amor"
            fill
            className="object-contain"
            priority
          />
        </div>
        <p className="mt-6 font-serif text-xl md:text-2xl text-primary font-bold text-center">
          ¡Gracias por tu preferencia!
        </p>
      </div>

    </div>
  );
}

export default function PagoExitosoPage() {
  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-[80vh] flex items-center justify-center bg-background/50">
      <Card className="max-w-4xl w-full shadow-2xl border-primary/10 bg-card overflow-hidden">
        <CardContent className="p-6 md:p-12">
          <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />}>
            <EstadoDelPago />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}