import { getActivePromotions } from "@/actions/promotion-actions";
import CartPageClient from "./CartPageClient";

export default async function CartPage() {
    const promotions = await getActivePromotions();

    const promoData = promotions.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type as "PERCENTAGE" | "FIXED" | "BUY_X_GET_Y",
        value: p.value,
        minOrderAmount: p.minOrderAmount,
        buyQuantity: p.buyQuantity,
        getQuantity: p.getQuantity,
        applicableProductIds: p.products.map(pp => pp.product.id)
    }));

    return <CartPageClient promotions={promoData} />;
}