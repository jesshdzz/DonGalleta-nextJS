import { getAdminFlavors } from "@/actions/flavor-actions";
import { FlavorDialog } from "@/components/admin/flavor-form";
import { FlavorDeleteButton } from "@/components/admin/flavor-delete-button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Tag } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminFlavorsPage({ searchParams }: Props) {
    const params = await searchParams;
    const pageParam = params?.page;
    const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) || 1 : 1;

    const { flavors, totalPages, currentPage, totalItems } = await getAdminFlavors({ page, pageSize: 10 });

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="mb-8">
                <Link href="/admin/productos">
                    <Button variant="ghost" className="pl-0 gap-2 text-muted-foreground mb-4">
                        <ArrowLeft className="h-4 w-4" /> Volver a Productos
                    </Button>
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary font-serif">Sabores</h1>
                        <p className="text-muted-foreground">Gestiona los sabores disponibles para tus galletas.</p>
                    </div>
                    {/* Botón para crear nuevo sabor */}
                    <FlavorDialog />
                </div>
            </div>

            <div className="rounded-lg border bg-card shadow-sm">
                <Table>
                    <TableCaption>Mostrando {flavors.length} sabores de un total de {totalItems}.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-25">ID</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {flavors.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                                    No hay sabores registrados aún.
                                </TableCell>
                            </TableRow>
                        )}
                        {flavors.map((flavor) => (
                            <TableRow key={flavor.id}>
                                <TableCell className="font-mono text-xs">{flavor.id}</TableCell>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-primary/50" />
                                        {flavor.name}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {/* Botón Editar (abre diálogo con datos) */}
                                    <FlavorDialog
                                        flavorToEdit={flavor}
                                        trigger={
                                            <Button variant="ghost" size="icon">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        }
                                    />

                                    {/* Botón Eliminar */}
                                    <FlavorDeleteButton id={flavor.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/admin/sabores"
                searchParams={params as Record<string, string | string[]>}
            />
        </div>
    );
}
