import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, ArrowRight, BadgePercent, BadgeDollarSign } from "lucide-react";
import { getActivePromotions } from "@/actions/pomotion-actions";
import Link from "next/link";

type DiscountType = "PERCENTAGE" | "FIXED" | "BUY_X_GET_Y";

const TYPE_META: Record<DiscountType, { icon: React.ElementType; label: string; badgeFn: (promo: { value: number; buyQuantity?: number | null; getQuantity?: number | null }) => string; color: string; text: string }> = {
    PERCENTAGE: {
        icon: BadgePercent,
        label: "Descuento porcentual",
        badgeFn: (p) => `${p.value}% OFF`,
        color: "bg-blue-400",
        text: "text-blue-600",
    },
    FIXED: {
        icon: BadgeDollarSign,
        label: "Descuento fijo",
        badgeFn: (p) => `-$${p.value.toFixed(0)}`,
        color: "bg-amber-400",
        text: "text-amber-600",
    },
    BUY_X_GET_Y: {
        icon: Gift,
        label: "Compra y lleva",
        badgeFn: (p) => p.buyQuantity && p.getQuantity ? `${p.buyQuantity}x${p.getQuantity}` : "Promo",
        color: "bg-purple-400",
        text: "text-purple-500",
    },
};

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export async function Promotions() {
    const promotions = await getActivePromotions();

    if (promotions.length === 0) return null;

    return (
        <section className="w-full py-12 md:py-24 bg-secondary/20">
            <div className="px-4 md:px-6 max-w-7xl mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                            Ofertas Especiales
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-primary">
                            Promociones Activas
                        </h2>
                        <p className="max-w-xl text-muted-foreground md:text-lg/relaxed">
                            Aprovecha nuestras ofertas exclusivas y disfruta más dulzura por menos.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {promotions.map((promo) => {
                        const meta = TYPE_META[promo.type as DiscountType] ?? TYPE_META.FIXED;
                        const Icon = meta.icon;
                        const badgeLabel = meta.badgeFn(promo);
                        const applicableProducts = promo.products.map((pp) => pp.product.name);

                        return (
                            <Card key={promo.id} className="max-h-60 relative overflow-hidden border-2 border-dashed border-secondary hover:border-primary/40 transition-colors group">
                                {/* Badge de descuento */}
                                <span className={`absolute top-3 right-3 text-white text-xs font-bold px-2.5 py-1 rounded-full ${meta.color}`}>
                                    {badgeLabel}
                                </span>

                                <CardHeader className="pb-1 min-h-2/5 gap-0">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Icon className={`h-7 w-7 shrink-0 ${meta.text}`} />
                                        <h3>
                                            {promo.name}
                                        </h3>
                                    </CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">
                                        <span className={`font-semibold ${meta.text}`}>{meta.label}</span> • Válido hasta el {formatDate(promo.expirationDate)}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="flex flex-col justify-end min-h-3/5 pb-5">
                                    {/* Condiciones */}
                                    <div className="text-sm text-muted-foreground">
                                        {/* PERCENTAGE / FIXED: condiciones de monto */}
                                        {promo.type !== "BUY_X_GET_Y" && promo.minOrderAmount != null && promo.minOrderAmount > 0 && (
                                            <p>🛒 Compra mínima: <span className="font-semibold text-foreground">${promo.minOrderAmount.toFixed(2)}</span></p>
                                        )}
                                        {promo.type === "PERCENTAGE" && promo.maxDiscountCap != null && promo.maxDiscountCap > 0 && (
                                            <p className="mt-0">🎯 Descuento máximo: <span className="font-semibold text-foreground">${promo.maxDiscountCap.toFixed(2)}</span></p>
                                        )}
                                        {/* BUY_X_GET_Y: muestra X y Y */}
                                        {promo.type === "BUY_X_GET_Y" && promo.buyQuantity && promo.getQuantity && (
                                            <p>🛍️ Compra <span className="font-semibold text-foreground">{promo.buyQuantity}</span>, lleva <span className="font-semibold text-foreground">{promo.getQuantity}</span> gratis</p>
                                        )}
                                    </div>

                                    {/* Productos aplicables */}
                                    {applicableProducts.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5 my-1">
                                            {applicableProducts.slice(0, 3).map((name) => (
                                                <Badge key={name} variant="secondary" className="text-xs font-normal">
                                                    {name}
                                                </Badge>
                                            ))}
                                            {applicableProducts.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{applicableProducts.length - 3} más
                                                </Badge>
                                            )}
                                        </div>
                                    ) : (
                                        <Badge variant="secondary" className="text-xs font-normal">Aplica a todos los productos</Badge>
                                    )}

                                    <Link href="/productos" className="block pt-1">
                                        <Button variant="outline" size="sm" className="w-full gap-1 group-hover:border-primary group-hover:text-primary transition-colors">
                                            Ver productos <ArrowRight className="h-3 w-3" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
