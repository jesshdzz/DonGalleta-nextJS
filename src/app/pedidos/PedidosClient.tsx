"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Clock,
  Cookie,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getUserOrders, cancelOrder } from "@/actions/orders-actions";

type OrderItem = {
  id: string;
  productId: number;
  quantity: number;
  price: number;
  product?: { name: string };
};

export type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string | Date;
  items: OrderItem[];
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 py-1.5 px-3 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" /> Recibido
        </Badge>
      );
    case "PROCESSING":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 py-1.5 px-3 text-sm flex items-center gap-2">
          <Cookie className="w-4 h-4 animate-pulse" /> En preparación
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 py-1.5 px-3 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Entregado
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 py-1.5 px-3 text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" /> Cancelado
        </Badge>
      );
    default:
      return <Badge variant="secondary">Desconocido</Badge>;
  }
};

export function PedidosClient({ initialOrders = [] }: { initialOrders?: Order[] }) {
  const { status: sessionStatus } = useSession();
  const router = useRouter();

  const [pedidos, setPedidos] = useState<Order[]>(initialOrders);
  const [cargando, setCargando] = useState(false); // We initialize with data, so no loading initially
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);

  const obtenerPedidos = async () => {
    try {
      const response = await getUserOrders();
      if (response.success && response.orders) {
        setPedidos(response.orders as Order[]);
      }
    } catch (error) {
      console.error("Error cargando los pedidos:", error);
    }
  };

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (sessionStatus === "authenticated") {
      const intervalo = setInterval(() => {
        obtenerPedidos();
      }, 10000);

      return () => clearInterval(intervalo);
    }
  }, [sessionStatus, router]);

  // Lógica para cancelar pedido
  const handleCancelarPedido = async (orderId: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar este pedido? Se devolverá el stock.")) return;

    setCancelandoId(orderId);
    try {
      const result = await cancelOrder(orderId);

      if (result.success) {
        toast.success("Pedido cancelado", {
          description: "Tu pedido ha sido cancelado exitosamente.",
          icon: <CheckCircle2 className="text-green-500" />
        });
        obtenerPedidos(); // Refrescamos la lista
      } else {
        toast.error("No se pudo cancelar", {
          description: result.error,
          icon: <AlertTriangle className="text-red-500" />
        });
      }
    } catch (error) {
      toast.error("Error del servidor", {
        description: "Ocurrió un error inesperado al intentar cancelar."
      });
    } finally {
      setCancelandoId(null);
    }
  };

  if (sessionStatus === "loading" || cargando) {
    return (
      <div className="flex h-screen items-center justify-center space-x-2 text-primary">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-xl font-medium">Buscando tus galletas...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

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
          <p className="text-muted-foreground">Sigue el estado de tus galletas en tiempo real.</p>
        </div>
      </div>

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
        <div className="space-y-6">
          {pedidos.map((pedido) => {
            // Validaciones para mostrar el botón de cancelar
            const esPendiente = pedido.status === "PENDING";
            const msTranscurridos = Date.now() - new Date(pedido.createdAt).getTime();
            const limiteUnaHora = 3600000;
            const sePuedeCancelar = esPendiente && (msTranscurridos < limiteUnaHora);

            return (
              <Card key={pedido.id} className="shadow-md border-primary/10 overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-secondary/10 border-b border-primary/5 pb-4">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <CardTitle className="text-lg font-mono text-primary flex items-center gap-3">
                        Pedido #{pedido.id.slice(0, 8).toUpperCase()}
                        {getStatusBadge(pedido.status)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-2">
                        {new Date(pedido.createdAt).toLocaleDateString('es-MX', {
                          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2">
                      <div className="text-left md:text-right">
                        <span className="text-sm text-muted-foreground block">Total pagado</span>
                        <span className="text-2xl font-bold text-foreground">
                          ${Number(pedido.total).toFixed(2)}
                        </span>
                      </div>

                      {/* Botón de Cancelación */}
                      {sePuedeCancelar && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mt-2 w-full md:w-auto"
                          onClick={() => handleCancelarPedido(pedido.id)}
                          disabled={cancelandoId === pedido.id}
                        >
                          {cancelandoId === pedido.id ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cancelando...</>
                          ) : (
                            <><XCircle className="w-4 h-4 mr-2" /> Cancelar Pedido</>
                          )}
                        </Button>
                      )}

                      {/* Mensaje sutil si es pendiente pero ya pasó la hora */}
                      {esPendiente && !sePuedeCancelar && (
                        <span className="text-xs text-muted-foreground">
                          El tiempo para cancelar expiró
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="bg-secondary/5 rounded-lg p-4 border border-border">
                    <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-muted-foreground">
                      Resumen de artículos
                    </h4>
                    <div className="space-y-2">
                      {pedido.items?.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm font-medium">
                          <span>
                            <span className="text-primary mr-2 font-bold">{item.quantity}x</span>
                            {item.product?.name || `Producto #${item.productId}`}
                          </span>
                          <span className="text-muted-foreground">${Number(item.price * item.quantity).toFixed(2)}</span>
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
  );
}
