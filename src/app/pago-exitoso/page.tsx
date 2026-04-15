"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, FileText, MessageCircle, Loader2, Package, Mail } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

import logoImg from "@/assets/images/logo.png";
import { verifyPaymentIntent } from "@/actions/payment-actions";
import { generarTicketPDF } from "@/utils/pdf-generator";

function EstadoDelPago() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  interface OrderData { id: string; createdAt: string | Date; total: number | string; user?: { name: string | null }; items: { id: string | number; quantity: number; price: number | string; product?: { name: string } | null }[]; }
  const [ordenDb, setOrdenDb] = useState<OrderData | null>(null);
  const yaProcesado = useRef(false);
  
  // Estados para el modal de email
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (yaProcesado.current) return;
    if (!paymentIntent) { queueMicrotask(() => setStatus("error")); return; }

    if (redirectStatus === "succeeded") {
      yaProcesado.current = true;

      // ¡AQUÍ ESTÁ LA MAGIA DE LA LIMPIEZA!
      // Ejecutamos esto INMEDIATAMENTE al tener éxito para que el Navbar baje a 0
      clearCart(true);

      const buscarOrden = async () => {
        try {
          const res = await verifyPaymentIntent(paymentIntent);
          if (res.success && res.order) {
            setOrdenDb(res.order);
            setStatus("success");
          } else {
            setStatus("error");
          }
        } catch {
          setStatus("error");
        }
      };
      buscarOrden();
    } else {
      queueMicrotask(() => setStatus("error"));
    }
  }, [paymentIntent, redirectStatus, clearCart]);

  const descargarPDF = () => {
    generarTicketPDF("ticket-compra", ordenDb?.id?.slice(0, 8) || 'Comprobante');
  };

  const compartirWhatsApp = () => {
    if (!ordenDb) {
      toast.error("Datos del pedido no disponibles");
      return;
    }

    const subtotalCalc = Number(ordenDb.total) / 1.16;
    const ivaCalc = Number(ordenDb.total) - subtotalCalc;

    const mensaje = `DON GALLETA S.A. DE C.V.
RFC: DGA260305XXX
Acatlima, Huajuapan de Leon
Oaxaca, Mexico. C.P. 69004
Tel: (951) 555-0123

========================================
COMPROBANTE DE COMPRA
========================================

ORDEN BD: #${ordenDb?.id?.slice(0, 8).toUpperCase()}
FECHA: ${new Date(ordenDb?.createdAt || Date.now()).toLocaleDateString('es-MX')}
CLIENTE: ${ordenDb?.user?.name || "Invitado"}
METODO: Stripe

----------------------------------------
CANT / ART.          P.U.        TOTAL
----------------------------------------
${ordenDb?.items?.map((item: any) => 
  `${item.quantity}x ${(item.product?.name || 'Producto').substring(0, 12).padEnd(15)} $${Number(item.price).toFixed(2).padStart(6)} $${(item.price * item.quantity).toFixed(2).padStart(6)}`
).join('\n')}

----------------------------------------
SUBTOTAL:                    $${subtotalCalc.toFixed(2)}
IVA (16%):                   $${ivaCalc.toFixed(2)}
----------------------------------------
TOTAL MXN:                   $${Number(ordenDb?.total || 0).toFixed(2)}
========================================

GRACIAS POR TU COMPRA!

Dudas o aclaraciones: hola@dongalleta.com
Este documento no es un comprobante fiscal.

Mas productos en dongalleta.com`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank');
    toast.success("WhatsApp abierto con tu comprobante");
  };

  const compartirEmail = async () => {
    if (!ordenDb) {
      toast.error("Datos del pedido no disponibles");
      return;
    }

    // Abrir modal para capturar email
    setShowEmailModal(true);
  };

  const enviarComprobantePorEmail = async () => {
    if (!email.trim()) {
      toast.error("Por favor ingresa un email válido");
      return;
    }

    if (!ordenDb) {
      toast.error("Datos del pedido no disponibles");
      return;
    }

    setIsSending(true);
    try {
      toast.info("Enviando comprobante por email...");
      
      const response = await fetch('/api/send-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: ordenDb.id.slice(0, 8).toUpperCase(),
          customerName: ordenDb.user?.name || 'Cliente',
          customerEmail: email,
          items: ordenDb.items?.map((item: any) => ({
            quantity: item.quantity,
            name: item.product?.name || 'Producto',
            price: Number(item.price)
          })) || [],
          total: Number(ordenDb.total || 0),
          date: new Date(ordenDb.createdAt || Date.now()).toLocaleDateString('es-MX'),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Comprobante enviado a ${email} exitosamente!`);
        setShowEmailModal(false);
        setEmail("");
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error enviando email:', error);
      toast.error("Error al enviar el comprobante por email");
    } finally {
      setIsSending(false);
    }
  };

  const subtotalCalc = ordenDb ? Number(ordenDb.total) / 1.16 : 0;
  const ivaCalc = ordenDb ? Number(ordenDb.total) - subtotalCalc : 0;

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground text-lg text-center">
          Procesando pago y generando orden<br />
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
            <p className="text-muted-foreground text-lg">Tu orden ha sido registrada. Tu número de pedido es <b>#{ordenDb?.id?.slice(0, 8).toUpperCase()}</b>.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
          <Button variant="outline" className="gap-2 h-12 border-primary/20 hover:bg-primary/5 shadow-sm" onClick={descargarPDF}>
            <FileText className="w-5 h-5" /> Descargar
          </Button>
          <Button variant="outline" className="gap-2 h-12 border-blue-200 hover:bg-blue-50 hover:text-blue-700 text-blue-600 shadow-sm" onClick={compartirEmail}>
            <Mail className="w-5 h-5" /> Enviar Email
          </Button>
          <Button variant="outline" className="gap-2 h-12 border-green-200 hover:bg-green-50 hover:text-green-700 text-green-600 shadow-sm" onClick={compartirWhatsApp}>
            <MessageCircle className="w-5 h-5" /> WhatsApp
          </Button>
        </div>

        <div className="pt-2 w-full max-w-lg">
          <Link href="/">
            <Button size="lg" className="font-bold gap-2 w-full bg-primary hover:bg-primary/90">
              <Package className="w-5 h-5" /> Volver al inicio
            </Button>
          </Link>
        </div>
      </div>

      {/* Modal para capturar email */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar comprobante por email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && email.trim() && !isSending) {
                    enviarComprobantePorEmail();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowEmailModal(false);
                setEmail("");
              }}
              disabled={isSending}
            >
              Cancelar
            </Button>
            <Button
              onClick={enviarComprobantePorEmail}
              disabled={isSending || !email.trim()}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <span>{ordenDb ? new Date(ordenDb.createdAt).toLocaleDateString('es-MX') : ''}</span>
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
              {ordenDb?.items?.map((item: { id: number | string; quantity: number; product?: { name: string } | null; price: number | string }) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="w-1/2 pr-2 leading-tight">
                    <span className="font-bold">{item.quantity}x</span> {item.product?.name || 'Galleta'}
                  </div>
                  <span className="w-1/4 text-right">${Number(item.price).toFixed(2)}</span>
                  <span className="w-1/4 text-right font-bold">${(Number(item.price) * item.quantity).toFixed(2)}</span>
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