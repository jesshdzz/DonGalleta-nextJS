import { getPromotionById } from "@/actions/pomotion-actions";
import { getProducts } from "@/actions/product-actions";
import { PromotionForm } from "@/components/admin/promotion-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type PromotionFormValues, type PromotionType } from "@/lib/validators/promotion-schema";
interface EditPromotionProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditPromotionPage({ params }: EditPromotionProps) {
    const { id } = await params;
    const promotionId = parseInt(id);

    if (isNaN(promotionId)) {
        return notFound();
    }

    const [promotion, products] = await Promise.all([
        getPromotionById(promotionId),
        getProducts(),
    ]);

    if (!promotion) {
        return notFound();
    }

    const initialData = {
        ...promotion,
        type: promotion.type as PromotionType,
        value: promotion.value.toNumber(),
        minOrderAmount: promotion.minOrderAmount ? promotion.minOrderAmount.toNumber() : null,
        maxDiscountCap: promotion.maxDiscountCap ? promotion.maxDiscountCap.toNumber() : null,
        buyQuantity: promotion.buyQuantity,
        getQuantity: promotion.getQuantity,
        products: promotion.products.map(p => p.productId),
    } as Partial<PromotionFormValues> & { id: number };


    return (
        <div className="container mx-auto py-10 px-4 max-w-3xl">
            <div className="mb-8">
                <Link href="/admin/promociones">
                    <Button variant="ghost" className="pl-0 gap-2 text-muted-foreground mb-4">
                        <ArrowLeft className="h-4 w-4" /> Volver a las promociones
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-primary font-serif">Editar Promoción</h1>
                <p className="text-muted-foreground">Modifica los detalles de <span className="font-medium text-foreground">{promotion.name}</span></p>
            </div>

            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <PromotionForm defaultValues={initialData} availableProducts={products} />
            </div>
        </div>
    );
}