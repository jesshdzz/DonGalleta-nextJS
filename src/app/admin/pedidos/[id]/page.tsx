import { getAdminOrderById } from "@/actions/orders-actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cookie } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AdminOrderDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const order = await getAdminOrderById(id);

    if (!order) {
        return (
            <div className="container mx-auto py-10 px-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Pedido no encontrado</h1>
                <Link href="/admin/pedidos">
                    <Button>Volver a Pedidos</Button>
                </Link>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Pendiente</Badge>;
            case "PROCESSING":
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Procesando</Badge>;
            case "COMPLETED":
                return <Badge variant="secondary" className="bg-green-100 text-green-800">Completado</Badge>;
            case "CANCELLED":
                return <Badge variant="destructive">Cancelado</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="mb-8">
                <Link href="/admin/pedidos">
                    <Button variant="ghost" className="pl-0 gap-2 text-muted-foreground mb-4">
                        <ArrowLeft className="h-4 w-4" /> Volver a Pedidos
                    </Button>
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary font-serif">
                            Pedido #{order.id.slice(0, 8)}
                        </h1>
                        <p className="text-muted-foreground">
                            Realizado el {new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(order.createdAt))}
                        </p>
                    </div>
                    <div>
                        {getStatusBadge(order.status)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Detalles de los productos (Izquierda) */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Artículos del Pedido</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            {item.product.image ? (
                                                <img src={item.product.image} alt={item.product.name} className="h-16 w-16 rounded-md object-cover border" />
                                            ) : (
                                                <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center border">
                                                    <Cookie className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-semibold text-foreground">{item.product.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Precio unitario: ${item.price.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">x{item.quantity}</p>
                                            <p className="font-bold text-primary">${(item.quantity * item.price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen de Pago</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center py-2 font-bold text-lg border-t mt-2 pt-4">
                                <span>Total</span>
                                <span className="text-primary">${order.total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Información del Cliente y Estado (Derecha) */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Nombre</p>
                                <p className="font-medium">{order.user.name || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Correo electrónico</p>
                                <p className="font-medium break-all">{order.user.email}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Gestionar Estado</CardTitle>
                            <CardDescription>Actualiza la etapa de este pedido (Solo Visual).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estado del Pedido</label>
                                <select
                                    defaultValue={order.status}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="PENDING">Pendiente</option>
                                    <option value="PROCESSING">Procesando</option>
                                    <option value="COMPLETED">Completado</option>
                                    <option value="CANCELLED">Cancelado</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
