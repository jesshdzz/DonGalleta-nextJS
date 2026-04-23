import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Plus } from 'lucide-react';
import Link from 'next/link';
import { getAllPromotions } from '@/actions/pomotion-actions';

const TYPE_MAP = {
    PERCENTAGE: "Porcentaje",
    FIXED: "Fijo",
    BUY_X_GET_Y: "Compra X y llévate Y"
}

export default async function PromocionesPage() {
    const promotions = await getAllPromotions()

    return (
        <div className='container mx-auto py-10 px-4'>
            <div className='flex items-center justify-between mb-8'>
                <div>
                    <h1 className='text-3xl font-bold tracking-tight text-primary font-serif'>Promociones</h1>
                    <p className='text-muted-foreground'>Gestiona las promociones y combos de galletas.</p>
                </div>
                <Link href='/admin/promociones/nueva'>
                    <Button className='gap-2'>
                        <Plus className='h-4 w-4' /> Nueva Promoción
                    </Button>
                </Link>
            </div>

            <div className='rounded-lg border bg-card shadow-sm'>
                <Table>
                    <TableCaption>Lista total de promociones</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Monto mínimo de compra</TableHead>
                            <TableHead>Descuento máximo</TableHead>

                            <TableHead>Vigencia</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Última modificación</TableHead>
                            <TableHead className='text-right'>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {promotions.map((promotion) => (
                            <TableRow key={promotion.id}>
                                <TableCell>
                                    {promotion.name}
                                </TableCell>
                                <TableCell>
                                    {TYPE_MAP[promotion.type]}
                                </TableCell>
                                <TableCell>
                                    {promotion.type === "PERCENTAGE" ? `${promotion.value}%` : (promotion.type === "FIXED" ? `$${promotion.value}` : 'N/A')}
                                </TableCell>
                                <TableCell>
                                    {promotion.minOrderAmount ? `$${Number(promotion.minOrderAmount).toFixed(2)}` : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    {promotion.maxDiscountCap ? `$${Number(promotion.maxDiscountCap).toFixed(2)}` : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    {promotion.startDate.toISOString().split('T')[0]} - {promotion.expirationDate.toISOString().split('T')[0]}
                                </TableCell>
                                <TableCell>
                                    {promotion.isActive ? (
                                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">Activo</span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10">Inactivo</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {promotion.updatedAt.toISOString().split('T')[0]}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {/* Botón Editar */}
                                    <Link href={`/admin/promociones/${promotion.id}/editar`}>
                                        <Button variant="ghost" size="icon">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>

                                    {/* Botón Eliminar con Confirmación */}
                                    {/* <PromotionDeleteButton promotionId={promotion.id} /> */}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

        </div>
    );
}
