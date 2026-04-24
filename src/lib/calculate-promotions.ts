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
  
  // Clonamos el carrito para ir restando cantidades si una promo de BUY X GET Y se aplica
  const remainingCart = cart.map(i => ({ ...i }));

  // Primero evaluamos las BUY_X_GET_Y porque agrupan productos
  const buyXGetYPromos = promotions.filter(p => p.type === "BUY_X_GET_Y");
  
  for (const promo of buyXGetYPromos) {
      const buyQ = Number(promo.buyQuantity);
      const getQ = Number(promo.getQuantity);
      
      if (!buyQ || !getQ) continue;
      
      // Encontrar items aplicables
      const applicableItems = remainingCart.filter(item => 
          item.quantity > 0 && (promo.applicableProductIds.length === 0 || promo.applicableProductIds.includes(item.productId))
      );
      
      if (applicableItems.length === 0) continue;
      
      const totalApplicableQty = applicableItems.reduce((sum, item) => sum + item.quantity, 0);
      
      // La interpretación del usuario es "Lleva X, de las cuales Y son gratis" (ej. Lleva 12, Paga 10 -> X=12, Y=2)
      // Por tanto, el tamaño del grupo es exactamente X (buyQ).
      const groupSize = buyQ;
      
      // Asegurarse de que el tamaño del grupo sea lógicamente válido (X > Y)
      if (groupSize <= getQ) continue;
      
      const groups = Math.floor(totalApplicableQty / groupSize);
      const remainder = totalApplicableQty % groupSize;
      
      // Los items gratis son simplemente Y por cada grupo completo
      const freeItemsCount = groups * getQ;
      
      if (freeItemsCount > 0) {
          // Descontar los N items más baratos de los aplicables
          const flatItems: {price: number, productId: number}[] = [];
          for (const item of applicableItems) {
              for (let i = 0; i < item.quantity; i++) {
                  flatItems.push({ price: Number(item.price), productId: item.productId });
              }
          }
          // Ordenamos de menor a mayor precio
          flatItems.sort((a, b) => a.price - b.price);
          
          const freeItems = flatItems.slice(0, freeItemsCount);
          const discountForThisPromo = freeItems.reduce((sum, item) => sum + item.price, 0);
          totalDiscount += discountForThisPromo;
          
          // Consumir las cantidades para que no reciban otro descuento
          const consumedCount = groups * groupSize;
          let removed = 0;
          
          // Quitamos primero los que se hicieron gratis (los más baratos)
          for (const freeItem of freeItems) {
              const inRemaining = remainingCart.find(i => i.productId === freeItem.productId);
              if (inRemaining && inRemaining.quantity > 0) {
                  inRemaining.quantity -= 1;
                  removed += 1;
              }
          }
          
          // Luego quitamos los que pagaron el grupo (los más caros)
          const paidItems = flatItems.slice(freeItemsCount).reverse(); // más caros primero
          for (const paidItem of paidItems) {
              if (removed >= consumedCount) break;
              const inRemaining = remainingCart.find(i => i.productId === paidItem.productId);
              if (inRemaining && inRemaining.quantity > 0) {
                  inRemaining.quantity -= 1;
                  removed += 1;
              }
          }
      }
  }

  // Ahora evaluamos PERCENTAGE y FIXED para los items restantes
  for (const item of remainingCart) {
      if (item.quantity <= 0) continue;
      
      const itemPrice = Number(item.price);
      const itemTotal = itemPrice * item.quantity;
      
      const applicablePromos = promotions.filter(p => 
          p.type !== "BUY_X_GET_Y" && (p.applicableProductIds.length === 0 || p.applicableProductIds.includes(item.productId))
      );
      
      let bestDiscountForThisItem = 0;
      for (const promo of applicablePromos) {
          let promoDiscount = 0;
          const min = Number(promo.minOrderAmount || 0);
          const val = Number(promo.value || 0);
          
          if (promo.type === "PERCENTAGE") {
              if (itemTotal >= min) {
                  promoDiscount = itemTotal * (val / 100);
              }
          } else if (promo.type === "FIXED") {
              if (itemTotal >= min) {
                  promoDiscount = Math.min(itemTotal, val);
              }
          }
          
          if (promoDiscount > bestDiscountForThisItem) {
              bestDiscountForThisItem = promoDiscount;
          }
      }
      
      totalDiscount += bestDiscountForThisItem;
  }

  return totalDiscount;
}
