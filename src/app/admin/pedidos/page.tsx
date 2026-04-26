import { getAdminOrders } from "@/actions/orders-actions";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
    const params = await searchParams;
    const pageParam = params?.page;
    const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) || 1 : 1;

    const { orders, totalPages, currentPage, totalItems } = await getAdminOrders({ page, pageSize: 10 });

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
        <div className="container mx-auto py-10 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary font-serif">Pedidos</h1>
                    <p className="text-muted-foreground">Gestiona las compras de los clientes.</p>
                </div>
            </div>

            <div className="rounded-lg border bg-card shadow-sm">
                <Table>
                    <TableCaption>Mostrando {orders.length} pedidos de un total de {totalItems} registrados.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-30">ID Pedido</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    No hay pedidos registrados aún.
                                </TableCell>
                            </TableRow>
                        )}
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono text-xs font-medium">
                                    {order.id.slice(0, 8)}...
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">
                                        {new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(order.createdAt))}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' }).format(new Date(order.createdAt))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-foreground">{order.user.name || "Sin nombre"}</div>
                                    <div className="text-xs text-muted-foreground">{order.user.email}</div>
                                </TableCell>
                                <TableCell className="font-bold">
                                    ${order.total.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(order.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/admin/pedidos/${order.id}`}>
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only md:not-sr-only md:inline">Ver Detalles</span>
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/admin/pedidos"
                searchParams={params as Record<string, string | string[]>}
            />
        </div>
    );
}
