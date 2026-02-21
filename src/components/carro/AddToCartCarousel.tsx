"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Minus, Plus, ShoppingCart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string | null;
}

export default function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState<number | string>(1);
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const currentQty = typeof quantity === 'string' ? 1 : quantity;

  const handleIncrement = () => {
    if (currentQty < product.stock) setQuantity(currentQty + 1);
  };

  const handleDecrement = () => {
    if (currentQty > 1) setQuantity(currentQty - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setQuantity("");
      return;
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue)) setQuantity(numValue);
  };

  const handleBlur = () => {
    let finalValue = typeof quantity === 'string' ? 1 : quantity;
    if (finalValue < 1) finalValue = 1;
    if (finalValue > product.stock) finalValue = product.stock;
    setQuantity(finalValue);
  };

  const handleAddToCart = async () => {
    await addToCart(product, currentQty);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={currentQty <= 1}
          className="h-8 w-8 shrink-0"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Input
          type="text"
          value={quantity}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="w-14 h-9 text-center p-1 font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={currentQty >= product.stock}
          className="h-8 w-8 shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-center gap-4 w-full">
        
        {/* Precio Total */}
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Total
          </span>
          <span className="text-xl font-bold text-primary whitespace-nowrap">
            ${(product.price * currentQty).toFixed(2)}
          </span>
        </div>

        <Button
          onClick={handleAddToCart}
          className="px-6 shadow-sm transition-all hover:shadow-md hover:scale-105"
          size="default" 
          disabled={isAdded || product.stock === 0}
        >
          {isAdded ? (
            "¡Listo!"
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Agregar
            </>
          )}
        </Button>
      </div>

    </div>
  );
}