type DiscountType = "PERCENTAGE" | "FIXED" | "BUY_X_GET_Y";

export interface Promotion {
  id: number;
  name: string;
  type: DiscountType;
  value: number;
  minOrderAmount: number | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  applicableProductIds: number[];
}

export interface CartItem {
  productId: number;
  price: number;
  quantity: number;
}

export function calculatePromotionsDiscount(cart: CartItem[], promotions: Promotion[]): number {
  let totalDiscount = 0;

  for (const item of cart) {
    const itemTotal = item.price * item.quantity;
    
    // Encontrar promociones que aplican a este producto
    const applicablePromos = promotions.filter(p => 
      p.applicableProductIds.length === 0 || p.applicableProductIds.includes(item.productId)
    );

    if (applicablePromos.length === 0) continue;

    let bestDiscountForThisItem = 0;

    for (const promo of applicablePromos) {
      let promoDiscount = 0;

      if (promo.type === "PERCENTAGE") {
        const min = promo.minOrderAmount ?? 0;
        if (itemTotal >= min) {
          promoDiscount = itemTotal * (promo.value / 100);
        }
      } else if (promo.type === "FIXED") {
        const min = promo.minOrderAmount ?? 0;
        if (itemTotal >= min) {
          // El descuento no puede ser mayor que el total del ítem
          promoDiscount = Math.min(itemTotal, promo.value);
        }
      } else if (promo.type === "BUY_X_GET_Y" && promo.buyQuantity && promo.getQuantity) {
        const groups = Math.floor(item.quantity / (promo.buyQuantity + promo.getQuantity));
        const remainder = item.quantity % (promo.buyQuantity + promo.getQuantity);
        const freeItems = (groups * promo.getQuantity) + Math.max(0, remainder - promo.buyQuantity);
        
        promoDiscount = freeItems * item.price;
      }

      // Nos quedamos con el mejor descuento posible para este producto
      if (promoDiscount > bestDiscountForThisItem) {
        bestDiscountForThisItem = promoDiscount;
      }
    }

    totalDiscount += bestDiscountForThisItem;
  }

  return totalDiscount;
}
