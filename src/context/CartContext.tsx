"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { checkStock, checkout as checkoutAction } from "@/actions/product-actions";
import { toast } from "sonner";

// Definición estricta de Producto (lo mínimo que necesita el carrito)
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string | null;  // DB usa 'image'
  stock: number;
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string; // Normalizado a 'image'
  availableQuantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, newQuantity: number) => Promise<void>;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  checkout: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Cargar carrito desde localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
      localStorage.removeItem('cart');
    }
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = async (product: Product, quantity: number) => {
    try {
      const currentAvailableQuantity = await checkStock(product.id);

      const existingItem = cart.find(item => item.productId === product.id);
      const currentCartQuantity = existingItem ? existingItem.quantity : 0;

      if (currentCartQuantity + quantity > currentAvailableQuantity) {
        toast.error(`Solo quedan ${currentAvailableQuantity} unidades disponibles.`);
        return; // Salir sin lanzar error para no romper UI
      }

      setCart(prevCart => {
        if (existingItem) {
          return prevCart.map(item =>
            item.productId === product.id
              ? {
                ...item,
                quantity: item.quantity + quantity,
                availableQuantity: currentAvailableQuantity
              }
              : item
          );
        }
        return [
          ...prevCart,
          {
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            quantity,
            image: product.image || "/placeholder-product.jpg", // Normalizado
            availableQuantity: currentAvailableQuantity
          }
        ];
      });

      toast.success(`Agregaste ${quantity} ${product.name} al carrito.`);

    } catch (error) {
      console.error("Error al añadir al carrito:", error);
      toast.error("Error al verificar stock. Intenta de nuevo.");
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
    toast.info("Producto eliminado del carrito.");
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    try {
      const currentAvailableQuantity = await checkStock(productId);

      if (newQuantity > currentAvailableQuantity) {
        toast.warning(`No puedes agregar más. Solo hay ${currentAvailableQuantity} disponibles.`);
        // Actualizamos al máximo posible si el usuario intentó pasarse
        setCart(prevCart =>
          prevCart.map(item =>
            item.productId === productId
              ? { ...item, availableQuantity: currentAvailableQuantity } // Solo actualizamos info
              : item
          )
        );
        return;
      }

      setCart(prevCart =>
        prevCart.map(item =>
          item.productId === productId
            ? {
              ...item,
              quantity: newQuantity,
              availableQuantity: currentAvailableQuantity
            }
            : item
        )
      );
    } catch (error) {
      console.error("Error al actualizar cantidad:", error);
      toast.error("Error de conexión al actualizar.");
    }
  };

  const clearCart = () => {
    setCart([]);
    toast.info("Carrito vaciado.");
  };

  const checkout = async () => {
    try {
      const result = await checkoutAction(cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })));

      if (result.success) {
        clearCart();
        toast.success("¡Compra realizada con éxito!");
        return true;
      } else {
        toast.error(result.message || "Error al procesar la compra.");
        return false;
      }
    } catch (error) {
      console.error("Error durante el checkout:", error);
      toast.error("Ocurrió un error inesperado.");
      return false;
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        checkout
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}