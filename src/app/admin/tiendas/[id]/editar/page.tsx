import { StoreForm } from "@/components/admin/store-form";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditStorePage({ params }: EditPageProps) {
    const { id } = await params;

    const store = await prisma.store.findUnique({
        where: { id },
    });

    if (!store) {
        return notFound();
    }

    const initialData = {
        id: store.id,
        name: store.name,
        address: store.address,
        schedule: store.schedule || "",
        latitude: store.latitude,
        longitude: store.longitude,
        phone: store.phone || "",
        isActive: store.isActive,
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-3xl">
            <div className="mb-8">
                <Link href="/admin/tiendas">
                    <Button variant="ghost" className="pl-0 gap-2 text-muted-foreground mb-4">
                        <ArrowLeft className="h-4 w-4" /> Volver a sucursales
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-primary font-serif">Editar Sucursal</h1>
                <p className="text-muted-foreground">Modifica los detalles de <span className="font-medium text-foreground">{store.name}</span></p>
            </div>

            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <StoreForm defaultValues={initialData} />
            </div>
        </div>
    );
}
