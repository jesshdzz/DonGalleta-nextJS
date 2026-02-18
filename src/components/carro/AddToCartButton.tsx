"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string | null;
}

export default function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    await addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <span className="text-lg font-medium min-w-8 text-center">{quantity}</span>

        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={quantity >= product.stock}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Button
        onClick={handleAddToCart}
        className="w-full text-lg py-6 shadow-md transition-all hover:shadow-lg"
        size="lg"
        disabled={isAdded}
      >
        {isAdded ? "¡Agregado!" : (
          <>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Agregar al carrito (${(product.price * quantity).toFixed(2)})
          </>
        )}
      </Button>
    </div>
  );
}