import { getProducts } from "@/actions/product-actions";
import { ProductDeleteButton } from "@/components/admin/product-delete-button";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Package } from "lucide-react";
import Link from "next/link";

export default async function AdminProductsPage() {
    const products = await getProducts();

    return (
        <div className="container mx-auto py-10 px-4">

            {/* Encabezado */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary font-serif">Inventario</h1>
                    <p className="text-muted-foreground">Gestiona el catálogo y existencias de galletas.</p>
                </div>
                <Link href="/admin/products/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Nuevo Producto
                    </Button>
                </Link>
            </div>

            {/* Tabla */}
            <div className="rounded-lg border bg-card shadow-sm">
                <Table>
                    <TableCaption>Lista total de productos en catálogo ({products.length})</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-20">Imagen</TableHead>
                            <TableHead>Nombre / Slug</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product: typeof products[number]) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                                    ) : (
                                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                            <Package className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-foreground">{product.name}</div>
                                    <div className="text-xs text-muted-foreground hidden md:inline-block">/{product.slug}</div>
                                </TableCell>
                                <TableCell className="font-bold text-primary">
                                    ${Number(product.price).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    {product.stock === 0 ? (
                                        <Badge variant="destructive">Agotado</Badge>
                                    ) : product.stock < 10 ? (
                                        <Badge variant="secondary" className="text-amber-700">Bajo ({product.stock})</Badge>
                                    ) : (
                                        <span className="text-sm font-medium">{product.stock} un.</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {product.isActive ? (
                                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">Activo</span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10">Inactivo</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {/* Botón Editar */}
                                    <Link href={`/admin/products/${product.id}/edit`}>
                                        <Button variant="ghost" size="icon">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>

                                    {/* Botón Eliminar con Confirmación */}
                                    <ProductDeleteButton productId={product.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}