"use client";
import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { checkStock, checkout as checkoutAction } from "@/actions/cart-actions";
import { getCart, syncCart, clearCart } from "@/actions/cart-actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // SEGURO ANTI-RECARGA: Evita que la DB reescriba un carrito recién vaciado
  const cartClearedRef = useRef(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {
      console.error('Error loading cart:', e);
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
    localStorage.setItem('cart', JSON.stringify(cart));

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
    } catch (e) {
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
    } catch (e) {
      toast.error("Error al actualizar.");
    }
  };

  const clearCart = (silent: boolean = false) => {
    cartClearedRef.current = true; // Activamos el seguro
    setCart([]);
    localStorage.removeItem('cart');
    setAppliedCoupon(null);
    if (status === "authenticated") clearCart();
    if (!silent) toast.info("Carrito vaciado.");
  };

  const logoutClearCart = () => {
    cartClearedRef.current = true;
    setCart([]);
    localStorage.removeItem('cart');
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

  const discountAmount = appliedCoupon
    ? (appliedCoupon.discountType === 'PERCENTAGE'
      ? (totalPrice * (appliedCoupon.discountValue / 100))
      : appliedCoupon.discountValue)
    : 0;
  const discountedPrice = Math.max(0, totalPrice - discountAmount);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, logoutClearCart, refreshCartStock,
      totalItems, totalPrice, discountedPrice, appliedCoupon, applyCoupon: setAppliedCoupon, checkout
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