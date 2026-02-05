import { ProductForm } from "@/components/admin/product-form";
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

export default async function EditProductPage({ params }: EditPageProps) {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
        return notFound();
    }

    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        return notFound();
    }

    const initialData = {
        ...product,
        price: Number(product.price),
        description: product.description || "",
        image: product.image || "",
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-3xl">
            <div className="mb-8">
                <Link href="/admin/products">
                    <Button variant="ghost" className="pl-0 gap-2 text-muted-foreground mb-4">
                        <ArrowLeft className="h-4 w-4" /> Volver al inventario
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-primary font-serif">Editar Producto</h1>
                <p className="text-muted-foreground">Modifica los detalles de <span className="font-medium text-foreground">{product.name}</span></p>
            </div>

            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <ProductForm defaultValues={initialData} />
            </div>
        </div>
    );
}