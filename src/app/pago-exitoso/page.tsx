"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Home, FileText, MessageCircle, Loader2, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

import logoImg from "@/assets/images/logo.png";

// componente que maneja el estado de pago
function EstadoDelPago() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  
  const [ordenDb, setOrdenDb] = useState<any>(null);
  const yaProcesado = useRef(false);

  //efecto que verifica el estado del pago y busca la orden en la base de datos
  useEffect(() => {
    if (yaProcesado.current) return;
    if (!paymentIntent) { setStatus("error"); return; }

    if (redirectStatus === "succeeded") {
      clearCart();
      yaProcesado.current = true;
      
      let intentos = 0;
      
      // funcion para buscar la orden en la base de datos
      const buscarOrden = async () => {
        try {
          const res = await fetch(`/api/pedidos/verificar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intent: paymentIntent })
          });

          if (res.ok) {
            const data = await res.json();
            setOrdenDb(data);
            setStatus("success");
          } else {
            intentos++;
            if (intentos < 10) {
              setTimeout(buscarOrden, 2000); // reintenta cada 2 segundos
            } else {
              setStatus("error"); // fallo despues de 10 intentos
            }
          }
        } catch (error) {
          setStatus("error");
        }
      };

      buscarOrden();
    } else {
      setStatus("error");
    }
  }, [paymentIntent, redirectStatus, clearCart]);

  // funcion para descargar el recibo en PDF usando html2pdf.js
  const descargarPDF = () => {
    const element = document.getElementById("ticket-compra");
    if (!element) return;
    import("html2pdf.js").then((html2pdf) => {
      const opt = {
        margin: 0.3,
        filename: `Ticket-DonGalleta-${ordenDb?.id?.slice(0, 8) || 'Comprobante'}.pdf`,
        image: { type: 'png' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: [3.15, 6.5] as [number, number], orientation: 'portrait' as const }
      };
      toast.success("Generando recibo...");
      html2pdf.default().set(opt).from(element).save();
    });
  };

  const enviarWhatsApp = () => toast.info("Función de WhatsApp en desarrollo");

  const subtotalCalc = ordenDb ? Number(ordenDb.total) / 1.16 : 0;
  const ivaCalc = ordenDb ? Number(ordenDb.total) - subtotalCalc : 0;

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground text-lg text-center">
          Procesando pago y generando orden<br/>
          <span className="text-sm">Esto puede tomar unos segundos...</span>
        </p>
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
        <Link href="/pago"><Button size="lg" className="mt-4 font-bold">Volver a intentar</Button></Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start w-full">
      <div className="order-1 flex flex-col items-center md:items-start text-center md:text-left space-y-8 w-full sticky top-24">
        <div className="flex flex-col items-center md:items-start space-y-4 w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-serif font-bold text-primary">¡Pago Aprobado!</h2>
            <p className="text-muted-foreground text-lg">Tu orden ha sido registrada. Tu número de pedido es <b>#{ordenDb?.id?.slice(0,8).toUpperCase()}</b>.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          <Button variant="outline" className="gap-2 h-12 border-primary/20 hover:bg-primary/5 shadow-sm" onClick={descargarPDF}>
            <FileText className="w-5 h-5" /> Descargar Recibo
          </Button>
          <Button variant="outline" className="gap-2 h-12 border-green-200 hover:bg-green-50 hover:text-green-700 text-green-600 shadow-sm" onClick={enviarWhatsApp}>
            <MessageCircle className="w-5 h-5" /> Enviar WhatsApp
          </Button>
        </div>

        <div className="pt-2 w-full max-w-md">
          <Link href="/">
            <Button size="lg" className="font-bold gap-2 w-full bg-primary hover:bg-primary/90">
              <Package className="w-5 h-5" /> Volver al inicio
            </Button>
          </Link>
        </div>
      </div>

      <div className="order-2 flex flex-col items-center justify-center bg-secondary/5 rounded-2xl p-4 md:p-8 border border-primary/10 h-full">
        <div id="ticket-compra" className="w-full max-w-[320px] bg-[#ffffff] px-6 py-8 shadow-xl relative font-mono text-[#1f2937]" style={{ color: '#000000', borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
          <div className="absolute top-0 left-0 w-full h-2 bg-[radial-gradient(circle,transparent_4px,#ffffff_5px)] bg-size-[10px_10px] -mt-2"></div>

          <div className="flex flex-col items-center mb-6 text-center">
            <Image src={logoImg} alt="Don Galleta Logo" width={100} height={60} className="object-contain mb-3 grayscale opacity-90" unoptimized />
            <h2 className="font-bold text-base text-[#000000] uppercase tracking-wide">Don Galleta S.A. de C.V.</h2>
            <p className="text-[11px] leading-tight mt-1 text-[#4b5563]">RFC: DGA260305XXX</p>
            <p className="text-[11px] leading-tight text-[#4b5563]">Acatlima, Huajuapan de León</p>
            <p className="text-[11px] leading-tight text-[#4b5563]">Oaxaca, México. C.P. 69004</p>
            <p className="text-[11px] leading-tight text-[#4b5563]">Tel: (951) 555-0123</p>
          </div>

          <div className="border-t border-b border-dashed border-[#9ca3af] py-3 mb-4 text-[11px] space-y-1 text-[#374151]">
            <div className="flex justify-between">
              <span className="font-bold">ORDEN BD:</span>
              <span className="text-[#000000] font-bold">#{ordenDb?.id?.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">FECHA:</span>
              <span>{new Date(ordenDb?.createdAt || Date.now()).toLocaleDateString('es-MX')}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">CLIENTE:</span>
              <span className="truncate max-w-35 text-right">{ordenDb?.user?.name || "Invitado"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">MÉTODO:</span>
              <span>Stripe</span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-[11px] font-bold border-b border-[#d1d5db] pb-1 mb-2">
              <span className="w-1/2 text-left">CANT / ART.</span>
              <span className="w-1/4 text-right">P.U.</span>
              <span className="w-1/4 text-right">TOTAL</span>
            </div>
            
            <div className="space-y-2 text-[11px] text-[#374151]">
              {ordenDb?.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="w-1/2 pr-2 leading-tight">
                    <span className="font-bold">{item.quantity}x</span> {item.product?.name || 'Galleta'}
                  </div>
                  <span className="w-1/4 text-right">${Number(item.price).toFixed(2)}</span>
                  <span className="w-1/4 text-right font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-dashed border-[#9ca3af] pt-3 pb-4 space-y-1 text-[11px]">
            <div className="flex justify-between text-[#4b5563]">
              <span>SUBTOTAL:</span>
              <span>${subtotalCalc.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#4b5563]">
              <span>IVA (16%):</span>
              <span>${ivaCalc.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-base text-[#000000] mt-2 pt-2 border-t border-[#000000]">
              <span>TOTAL MXN:</span>
              <span>${Number(ordenDb?.total || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-[#4b5563] mt-4 space-y-1">
            <p className="font-bold text-[#000000] text-xs">¡GRACIAS POR TU COMPRA!</p>
            <p>Dudas o aclaraciones: hola@dongalleta.com</p>
            <p>Este documento no es un comprobante fiscal.</p>
            <div className="mt-4 flex justify-center gap-0.5 h-8 opacity-70">
              {/* simulacion de codigo de barras */}
              <div className="w-1 bg-[#000000]"></div><div className="w-2 bg-[#000000]"></div><div className="w-1 bg-[#000000]"></div><div className="w-0.5 bg-[#000000]"></div><div className="w-3 bg-[#000000]"></div><div className="w-1 bg-[#000000]"></div><div className="w-0.5 bg-[#000000]"></div><div className="w-2 bg-[#000000]"></div><div className="w-0.5 bg-[#000000]"></div><div className="w-1 bg-[#000000]"></div><div className="w-2 bg-[#000000]"></div><div className="w-1 bg-[#000000]"></div><div className="w-0.75 bg-[#000000]"></div><div className="w-1 bg-[#000000]"></div><div className="w-2 bg-[#000000]"></div>
            </div>
            <p className="text-[8px] tracking-widest mt-1">{paymentIntent?.slice(0, 14).toUpperCase()}</p>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-2 bg-[radial-gradient(circle,transparent_4px,#ffffff_5px)] bg-size-[10px_10px] -mb-2 rotate-180"></div>
        </div>
      </div>
    </div>
  );
}

export default function PagoExitosoPage() {
  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-[80vh] flex items-center justify-center bg-background">
      <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />}>
        <EstadoDelPago />
      </Suspense>
    </div>
  );
}