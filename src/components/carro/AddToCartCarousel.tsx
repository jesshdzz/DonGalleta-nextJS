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

export default function AddToCartCarousel({ product }: { product: Product }) {
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
    // CAMBIO 1: sm:items-stretch hace que en escritorio todo busque ocupar el 100% del ancho
    <div className="flex flex-col items-center sm:items-stretch gap-1.5 sm:gap-4 w-full">
      
      {/* 1. CONTROLES DE CANTIDAD (+ / -) */}
      {/* CAMBIO 2: sm:justify-between empuja los botones a las orillas */}
      <div className="flex items-center justify-center sm:justify-between w-full gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={currentQty <= 1}
          className="h-7 w-7 sm:h-9 sm:w-10 shrink-0" 
        >
          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        <Input
          type="text"
          value={quantity}
          onChange={handleInputChange}
          onBlur={handleBlur}
          // CAMBIO 3: sm:flex-1 hace que el input sea el que absorba todo el espacio vacío en el centro
          className="w-10 h-7 sm:w-auto sm:flex-1 sm:h-9 text-xs sm:text-base text-center p-1 font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={currentQty >= product.stock}
          className="h-7 w-7 sm:h-9 sm:w-10 shrink-0"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* 2. PRECIO Y BOTÓN AGREGAR */}
      {/* CAMBIO: Redujimos sm:gap-3 a sm:gap-1.5 para juntarlos esa "cosita shikita" */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-1.5 w-full">
        
        {/* Precio Total */}
        <div className="flex flex-col items-center sm:items-start shrink-0">
          <span className="hidden sm:block text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Total
          </span>
          <span className="text-base sm:text-xl font-bold text-primary whitespace-nowrap leading-none">
            ${(product.price * currentQty).toFixed(2)}
          </span>
        </div>

        {/* Botón Agregar */}
        {/* CAMBIO: Le quitamos el sm:ml-2 que le estaba dando un empujón extra de 8px */}
        <Button
          onClick={handleAddToCart}
          className="w-full sm:flex-1 h-8 sm:h-10 text-xs sm:text-sm shadow-sm transition-all hover:shadow-md hover:scale-105"
          size="default" 
          disabled={isAdded || product.stock === 0}
        >
          {isAdded ? (
            "¡Listo!"
          ) : (
            <>
              <ShoppingCart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Agregar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}