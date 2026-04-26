import { getAllUsers } from "@/actions/user-actions";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CircleUserRound, ShieldUser, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { auth } from "@/auth";
import { ChangeRoleButton } from "@/components/admin/change-role-button";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
    const params = await searchParams;
    const pageParam = params?.page;
    const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) || 1 : 1;

    const { users: usuarios, totalPages, currentPage, totalItems } = await getAllUsers({ page, pageSize: 10 });
    const session = await auth();
    const me = session?.user?.name;

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary font-serif">Usuarios</h1>
                    <p className="text-muted-foreground">Gestiona los usuarios registrados y sus roles.</p>
                </div>
            </div>

            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableCaption>Mostrando {usuarios.length} usuarios de un total de {totalItems}.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead className="text-center">Total de Pedidos</TableHead>
                            <TableHead className="text-center">Cambiar Rol</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usuarios.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                    No hay usuarios registrados aún.
                                </TableCell>
                            </TableRow>
                        )}
                        {usuarios.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        {user.image
                                            ? (
                                                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-muted bg-muted shrink-0">
                                                    <Image src={user.image} alt={user.name || "Usuario"} fill className="object-cover" />
                                                </div>)
                                            : (
                                                <div className="h-10 w-10 flex items-center justify-center">
                                                    <CircleUserRound className="h-5 w-5 text-muted-foreground" />
                                                </div>)
                                        }
                                        <span className="font-semibold text-foreground">{me === user.name ? user.name + " (tú)" : user.name || "Usuario Sin Nombre"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    <span className=" px-2 py-1 rounded-md text-sm">{user.email}</span>
                                </TableCell>
                                <TableCell>
                                    {user.role === 'ADMIN' ? (
                                        <Badge className="bg-primary hover:bg-primary/90 gap-1 rounded-full px-3 py-1">
                                            <ShieldUser className="h-3 w-3" />
                                            Administrador
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="gap-1 rounded-full px-3 py-1 bg-amber-100 text-amber-800">
                                            <UserIcon className="h-3 w-3" />
                                            Cliente
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-center font-medium">
                                    {user._count.orders > 0 ? (
                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            {user._count.orders}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">0</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    <ChangeRoleButton userId={user.id} newRole={user.role === 'ADMIN' ? 'USER' : 'ADMIN'} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/admin/usuarios"
                searchParams={params as Record<string, string | string[]>}
            />
        </div>
    );
}