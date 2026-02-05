"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { checkStock, checkout as checkoutAction } from "@/actions/product-actions";

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  availableQuantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity: number) => Promise<void>;
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

  // Cargar carrito desde localStorage al inicializar
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

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = async (product: any, quantity: number) => {
    try {
      // Usar Server Action para verificar stock real
      const currentAvailableQuantity = await checkStock(product.id);

      const existingItem = cart.find(item => item.productId === product.id);
      const currentCartQuantity = existingItem ? existingItem.quantity : 0;

      if (currentCartQuantity + quantity > currentAvailableQuantity) {
        throw new Error(`No hay suficiente cantidad. Disponible: ${currentAvailableQuantity}`);
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
            // El precio ya viene como número desde getProducts actualizado
            price: Number(product.price),
            quantity,
            image_url: product.image, // Nota: product.image en DB vs image_url en cart
            availableQuantity: currentAvailableQuantity
          }
        ];
      });
    } catch (error) {
      console.error("Error al añadir al carrito:", error);
      throw error;
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    try {
      const currentAvailableQuantity = await checkStock(productId);

      if (newQuantity > currentAvailableQuantity) {
        throw new Error(`No hay suficiente cantidad. Disponible: ${currentAvailableQuantity}`);
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
      throw error;
    }
  };

  const clearCart = () => setCart([]);

  const checkout = async () => {
    try {
      const result = await checkoutAction(cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })));

      if (result.success) {
        clearCart();
        return true;
      } else {
        console.error(result.message);
        return false;
      }
    } catch (error) {
      console.error("Error durante el checkout:", error);
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