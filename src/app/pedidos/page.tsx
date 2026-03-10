"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Package, 
  Clock, 
  Cookie, 
  Truck, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2, 
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Defino cómo se ven mis datos según el diagrama de DB que hice
type OrderItem = {
  id: string;
  productId: number;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  total: number;
  status: string; // Mi enum: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
  createdAt: string;
  OrderItems: OrderItem[]; 
};

// Diccionario para la línea de tiempo (Progreso del pedido)
const ESTADOS_PEDIDO = [
  { id: "PENDING", label: "Recibido", icon: Clock },
  { id: "PROCESSING", label: "Horneando", icon: Cookie },
  { id: "SHIPPED", label: "En Camino", icon: Truck },
  { id: "DELIVERED", label: "Entregado", icon: CheckCircle2 },
];

export default function MisPedidosPage() {
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [cargando, setCargando] = useState(true);

  // Función que va a mi API a buscar los datos frescos
  const obtenerPedidos = async () => {
    try {
      const res = await fetch("/api/pedidos");
      if (res.ok) {
        const data = await res.json();
        setPedidos(data);
      }
    } catch (error) {
      console.error("Error cargando los pedidos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    // Si no está logueado, lo pateamos amablemente al login
    if (sessionStatus === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (sessionStatus === "authenticated") {
      // Cargamos los pedidos por primera vez
      obtenerPedidos();

      // AQUÍ ESTÁ LA MAGIA DEL "TIEMPO REAL" 🪄
      // Ejecutamos la función cada 10 segundos para ver si el admin ya cambió el status en la DB
      const intervalo = setInterval(() => {
        obtenerPedidos();
      }, 10000); 

      // Limpiamos el intervalo si el usuario se sale de la página
      return () => clearInterval(intervalo);
    }
  }, [sessionStatus, router]);

  if (sessionStatus === "loading" || cargando) {
    return (
      <div className="flex h-screen items-center justify-center space-x-2 text-primary">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-xl font-medium">Buscando tus galletas...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-[80vh] bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cabecera y botón de regreso */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary flex items-center gap-2">
              <Package className="h-8 w-8" /> Mis Pedidos
            </h1>
            <p className="text-muted-foreground">Sigue el rastro de tus galletas en tiempo real.</p>
          </div>
        </div>

        {/* Si no ha comprado nada, le mostramos este mensaje */}
        {pedidos.length === 0 ? (
          <Card className="text-center py-16 border-dashed border-2 shadow-sm bg-secondary/5">
            <CardContent className="space-y-4">
              <div className="mx-auto w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center">
                <Cookie className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">Aún no tienes pedidos</h3>
              <p className="text-muted-foreground">¡Anímate a probar nuestras delicias recién horneadas!</p>
              <Link href="/productos">
                <Button className="mt-4 font-bold">Ir a la Tienda</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          // Si sí hay pedidos, hacemos un ciclo (map) para pintar cada tarjeta
          <div className="space-y-6">
            {pedidos.map((pedido) => {
              // Averiguamos en qué paso va el pedido buscando el índice en nuestro diccionario
              const currentStepIndex = ESTADOS_PEDIDO.findIndex(step => step.id === pedido.status);
              const isCancelled = pedido.status === "CANCELLED";

              return (
                <Card key={pedido.id} className="shadow-md border-primary/10 overflow-hidden">
                  <CardHeader className="bg-secondary/10 border-b border-primary/5 pb-4">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                      <div>
                        <CardTitle className="text-lg font-mono text-primary">
                          Pedido #{pedido.id.slice(0, 8).toUpperCase()}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(pedido.createdAt).toLocaleDateString('es-MX', { 
                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' 
                          })}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <span className="text-sm text-muted-foreground block">Total pagado</span>
                        <span className="text-xl font-bold text-foreground">
                          ${Number(pedido.total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    {/* SECCIÓN DEL TRACKING (Stepper Visual) */}
                    <div className="mb-8 relative pt-4">
                      {isCancelled ? (
                         <div className="flex items-center justify-center gap-2 text-destructive font-bold bg-destructive/10 p-4 rounded-lg">
                           <XCircle className="h-6 w-6" />
                           ESTE PEDIDO FUE CANCELADO
                         </div>
                      ) : (
                        <div className="flex justify-between items-center relative">
                          {/* La línea de fondo gris */}
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-secondary rounded-full -z-10"></div>
                          
                          {/* La línea verde que se va llenando */}
                          <div 
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 rounded-full -z-10 transition-all duration-500 ease-in-out"
                            style={{ width: `${(Math.max(currentStepIndex, 0) / (ESTADOS_PEDIDO.length - 1)) * 100}%` }}
                          ></div>

                          {/* Los circulitos de cada estado */}
                          {ESTADOS_PEDIDO.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            const Icon = step.icon;

                            return (
                              <div key={step.id} className="flex flex-col items-center gap-2 bg-card px-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                                  ${isCompleted ? 'bg-green-500 border-green-500 text-white shadow-md' : 'bg-background border-muted text-muted-foreground'}
                                  ${isCurrent ? 'ring-4 ring-green-100 scale-110' : ''}
                                `}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <span className={`text-xs md:text-sm font-semibold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* SECCIÓN DE PRODUCTOS COMPRADOS */}
                    <div className="bg-secondary/5 rounded-lg p-4 border border-border">
                      <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-muted-foreground">
                        Resumen de artículos
                      </h4>
                      <div className="space-y-2">
                        {pedido.OrderItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm font-medium">
                            <span>
                              <span className="text-primary mr-2">{item.quantity}x</span>
                              Producto ID: {item.productId} {/* Si unes la tabla de Productos después, aquí pones item.product.name */}
                            </span>
                            <span>${Number(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}