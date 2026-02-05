"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
      const response = await fetch(`/api/products/${product.id}`);
      if (!response.ok) throw new Error('Error al obtener información del producto');
      
      const currentProduct = await response.json();
      const currentAvailableQuantity = currentProduct.quantity;

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
            price: typeof product.price === 'string' 
              ? parseFloat(product.price.replace(/[^0-9.-]/g, '')) 
              : product.price,
            quantity,
            image_url: product.image_url,
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
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error('Error al verificar cantidad disponible');
      
      const currentProduct = await response.json();
      const currentAvailableQuantity = currentProduct.quantity;

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
      await Promise.all(
        cart.map(async (item) => {
          const response = await fetch(`/api/products/${item.productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quantity: item.availableQuantity - item.quantity
            }),
          });
          if (!response.ok) {
            throw new Error(`Error al actualizar producto ${item.productId}`);
          }
        })
      );
      clearCart();
      return true;
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