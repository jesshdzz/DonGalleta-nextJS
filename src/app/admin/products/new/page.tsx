import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-3xl">
            <div className="mb-8">
                <Link href="/admin/products">
                    <Button variant="ghost" className="pl-0 gap-2 text-muted-foreground mb-4">
                        <ArrowLeft className="h-4 w-4" /> Volver al inventario
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-primary font-serif">Crear Nuevo Producto</h1>
                <p className="text-muted-foreground">Llena los detalles para agregar una nueva galleta al catálogo.</p>
            </div>

            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <ProductForm />
            </div>
        </div>
    );
}