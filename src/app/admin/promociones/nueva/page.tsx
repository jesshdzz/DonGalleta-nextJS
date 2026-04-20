import { PromotionForm } from "@/components/admin/promotion-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewPromoPage() {
    return (
        <div className="container mx-auto py-10 px-10 max-w-3xl">
            <div className="mb-8">
                <Link href="/admin/promociones">
                    <Button variant="ghost" className="pl-0 gap-2 text-muted-foreground mb-4">
                        <ArrowLeft className="h-4 w-4" /> Volver a promociones
                    </Button>
                </Link>
                <h1 className="text-3xl font-semibold tracking-tight text-primary font-serif">Crear Nueva Promoción</h1>
                <p className="text-muted-foreground">
                    Llena los detalles para agregar una nueva promoción al sitio web.
                </p>
            </div>
            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <PromotionForm />
            </div>


        </div>
    );
}