"use client";
import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { checkStock, checkout as checkoutAction } from "@/actions/cart-actions";
import { getCart, syncCart, clearCart as clearCartApi } from "@/actions/cart-actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { getActivePromotions } from "@/actions/promotion-actions";
import { calculatePromotionsDiscount, Promotion } from "@/lib/calculate-promotions";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string | null;
  stock: number;
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  availableQuantity: number;
}

interface Coupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, newQuantity: number) => Promise<void>;
  clearCart: (silent?: boolean) => void;
  logoutClearCart: () => void;
  refreshCartStock: () => Promise<CartItem[]>; // <-- Añadido aquí
  totalItems: number;
  totalPrice: number;
  discountedPrice: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (coupon: Coupon | null) => void;
  checkout: () => Promise<{ success: boolean; message?: string; isAuthError?: boolean }>;
  promoDiscount: number;
}

const CART_STORAGE_VERSION = 1;

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  // SEGURO ANTI-RECARGA: Evita que la DB reescriba un carrito recién vaciado
  const cartClearedRef = useRef(false);

  useEffect(() => {
    getActivePromotions().then(promos => {
      const formattedPromos = promos.map((p: any) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        value: p.value,
        minOrderAmount: p.minOrderAmount,
        buyQuantity: p.buyQuantity,
        getQuantity: p.getQuantity,
        applicableProductIds: p.products?.map((pp: any) => pp.product?.id) || []
      }));
      setPromotions(formattedPromos as Promotion[]);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.version === CART_STORAGE_VERSION && Array.isArray(parsed?.data)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- Hidratación necesaria desde localStorage
          setCart(parsed.data);
        } else {
          localStorage.removeItem('cart_session');
          localStorage.removeItem('cart');
        }
      } else {
        const legacyCart = localStorage.getItem('cart');
        if (legacyCart) {
          setCart(JSON.parse(legacyCart));
          localStorage.removeItem('cart');
        }
      }
    } catch {
      console.error('Error loading cart');
      localStorage.removeItem('cart_session');
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && isLoaded) {
      const loadFromDb = async () => {
        const res = await getCart();
        // Si el carrito se vació mientras traíamos los datos, ignoramos la respuesta
        if (cartClearedRef.current) return;
        if (res.success && res.cart) {
          setCart(res.cart);
        }
      };
      loadFromDb();
    }
  }, [status, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('cart_session', JSON.stringify({ version: CART_STORAGE_VERSION, data: cart }));

    if (status === "authenticated") {
      const timer = setTimeout(() => {
        syncCart(cart.map(i => ({ productId: i.productId, quantity: i.quantity })));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cart, isLoaded, status]);

  const refreshCartStock = async () => {
    const updatedCart = await Promise.all(
      cart.map(async (item) => {
        const freshStock = await checkStock(item.productId);
        return { ...item, availableQuantity: freshStock };
      })
    );
    setCart(updatedCart);
    return updatedCart;
  };

  const addToCart = async (product: Product, quantity: number) => {
    cartClearedRef.current = false; // Quitamos el seguro si el usuario agrega algo nuevo
    try {
      const stock = await checkStock(product.id);
      const existing = cart.find(i => i.productId === product.id);
      const currentQty = existing ? existing.quantity : 0;

      if (stock <= 0) {
        toast.error("Producto agotado.");
        return;
      }

      if (currentQty + quantity > stock) {
        toast.error(`Solo quedan ${stock} disponibles.`);
        return;
      }

      setCart(prev => {
        if (existing) {
          return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + quantity, availableQuantity: stock } : i);
        }
        return [...prev, {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          quantity,
          image: product.image || "/placeholder-product.jpg",
          availableQuantity: stock
        }];
      });
      toast.success(`Agregaste ${product.name}.`);
    } catch {
      toast.error("Error al verificar stock.");
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) return removeFromCart(productId);
    try {
      const stock = await checkStock(productId);
      if (newQuantity > stock) {
        toast.warning(`Máximo disponible: ${stock}`);
        setCart(prev => prev.map(i => i.productId === productId ? { ...i, availableQuantity: stock } : i));
        return;
      }
      setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: newQuantity, availableQuantity: stock } : i));
    } catch {
      toast.error("Error al actualizar.");
    }
  };

  const clearCart = (silent: boolean = false) => {
    cartClearedRef.current = true; // Activamos el seguro
    setCart([]);
    localStorage.removeItem('cart_session');
    setAppliedCoupon(null);
    if (status === "authenticated") clearCartApi();
    if (!silent) toast.info("Carrito vaciado.");
  };

  const logoutClearCart = () => {
    cartClearedRef.current = true;
    setCart([]);
    localStorage.removeItem('cart_session');
    setAppliedCoupon(null);
  };

  const checkout = async () => {
    const freshCart = await refreshCartStock();
    const itemsValidos = freshCart.filter(item => item.availableQuantity > 0 && item.quantity <= item.availableQuantity);

    if (itemsValidos.length === 0) return { success: false, message: "Stock insuficiente" };

    const result = await checkoutAction(itemsValidos.map(i => ({ productId: i.productId, quantity: i.quantity })));
    if (result.success) {
      clearCart(true);
      return { success: true };
    }
    return result;
  };

  // MAGIA MATEMÁTICA: Ahora ignoramos si quantity > availableQuantity
  const validCartItems = cart.filter(item => item.availableQuantity > 0 && item.quantity <= item.availableQuantity);
  const totalItems = validCartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = validCartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  const promoDiscount = calculatePromotionsDiscount(validCartItems, promotions);

  // Aplicar cupón sobre el total o sobre el total después de promociones?
  // Normalmente los cupones aplican sobre el subtotal original o después. Hagámoslo sobre el precio total.
  const couponDiscountAmount = appliedCoupon
    ? (appliedCoupon.discountType === 'PERCENTAGE'
      ? (totalPrice * (appliedCoupon.discountValue / 100))
      : appliedCoupon.discountValue)
    : 0;
    
  const discountAmount = promoDiscount + couponDiscountAmount;
  const discountedPrice = Math.max(0, totalPrice - discountAmount);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, logoutClearCart, refreshCartStock,
      totalItems, totalPrice, discountedPrice, appliedCoupon, applyCoupon: setAppliedCoupon, checkout,
      promoDiscount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};