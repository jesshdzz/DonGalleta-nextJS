import { getStores } from "@/actions/store-actions";
import { StoreDeleteButton } from "@/components/admin/store-delete-button";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Plus, MapPin, Phone, Clock } from "lucide-react";
import Link from "next/link";

export default async function AdminStoresPage() {
    const stores = await getStores();

    return (
        <div className="container mx-auto py-10 px-4">

            {/* Encabezado */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary font-serif">Sucursales</h1>
                    <p className="text-muted-foreground">Gestiona las sucursales de Don Galleta.</p>
                </div>
                <div className="space-x-2">
                    <Link href="/admin/tiendas/nueva">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Nueva Sucursal
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Tabla */}
            <div className="rounded-lg border bg-card shadow-sm">
                <Table>
                    <TableCaption>Lista total de sucursales ({stores.length})</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Horario</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stores.map((store) => (
                            <TableRow key={store.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span className="font-medium text-foreground">{store.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm text-muted-foreground max-w-xs truncate">{store.address}</div>
                                </TableCell>
                                <TableCell>
                                    {store.phone ? (
                                        <div className="flex items-center gap-1 text-sm">
                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                            {store.phone}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">—</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {store.schedule ? (
                                        <div className="flex items-center gap-1 text-sm">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            {store.schedule}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">—</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {store.isActive ? (
                                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">Activa</span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10">Inactiva</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {/* Botón Editar */}
                                    <Link href={`/admin/tiendas/${store.id}/editar`}>
                                        <Button variant="ghost" size="icon">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>

                                    {/* Botón Eliminar con Confirmación */}
                                    <StoreDeleteButton storeId={store.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
