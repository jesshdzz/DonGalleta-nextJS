"use client";

import { useState, useTransition } from "react";
import { Heart, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/actions/favorite-actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  productId: number;
  initialIsFavorite?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "outline";
  showText?: boolean;
}

export default function FavoriteButton({
  productId,
  initialIsFavorite = false,
  size = "md",
  variant = "ghost",
  showText = false
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const router = useRouter();

  const handleToggleFavorite = () => {
    if (!session?.user) {
      toast.error("Debes iniciar sesión para añadir favoritos");
      router.push("/auth/login");
      return;
    }

    startTransition(async () => {
      try {
        const result = await toggleFavorite(productId);
        
        if (result.error) {
          toast.error(result.error);
        } else {
          const newFavoriteState = !isFavorite;
          setIsFavorite(newFavoriteState);
          
          if (newFavoriteState) {
            toast.success("¡Añadido a favoritos!", {
              icon: "❤️",
            });
          } else {
            toast.success("Eliminado de favoritos");
          }
        }
      } catch (error) {
        toast.error("Error al actualizar favoritos");
        console.error("Error:", error);
      }
    });
  };

  const getSize = () => {
    switch (size) {
      case "sm":
        return "h-8 w-8";
      case "lg":
        return "h-12 w-12";
      default:
        return "h-10 w-10";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return 16;
      case "lg":
        return 24;
      default:
        return 20;
    }
  };

  return (
    <Button
      variant={variant}
      size="icon"
      className={`${getSize()} transition-all duration-200 hover:scale-110 ${
        isFavorite 
          ? "text-red-500 hover:text-red-600 bg-red-50" 
          : "text-gray-400 hover:text-red-500"
      }`}
      onClick={handleToggleFavorite}
      disabled={isPending}
      title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      {isFavorite ? (
        <Heart 
          size={getIconSize()} 
          className="fill-current text-red-500" 
        />
      ) : (
        <Heart 
          size={getIconSize()} 
          className="hover:text-red-500 transition-colors" 
        />
      )}
      
      {showText && (
        <span className="ml-2 text-sm">
          {isFavorite ? "Favorito" : "Añadir"}
        </span>
      )}
    </Button>
  );
}