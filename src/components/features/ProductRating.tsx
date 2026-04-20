"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { submitReview, getUserReview } from "@/actions/review-actions";
import { cn } from "@/lib/utils";

interface ProductRatingProps {
  productId: number;
}

export function ProductRating({ productId }: ProductRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  //PARA GOS, ESTO ES PARA QUE SE MUESTRE LA CALIFICACION QUE YA TIENE EL PRODUCTO, MODIFICA PARA QUE OBTENGA EL review.comment
  useEffect(() => {
    async function loadRating() {
      try {
        const review = await getUserReview(productId);
        if (review && review.rating) {
          setRating(review.rating);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    loadRating();
  }, [productId]);

  const handleRate = async (selectedRating: number) => {
    const previousRating = rating;
    setRating(selectedRating);
    setIsSubmitting(true);

    try {
      const response = await submitReview(productId, selectedRating);
      if (response.success) {
        toast.success("¡Gracias por tu calificación!");
      } else {
        toast.error(response.error || "Ocurrió un error.");
        // Revertir si hay error
        setRating(previousRating);
      }
    } catch {
      toast.error("Hubo un problema al guardar tu calificación.");
      setRating(previousRating);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 py-4 border-t border-border mt-8">
      <h3 className="font-semibold text-2xl text-primary">¿Qué te pareció este producto?</h3>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= (hoverRating || rating);
          return (
            <button
              key={star}
              type="button"
              disabled={isSubmitting}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRate(star)}
              className={cn(
                "p-1 transition-all",
                isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"
              )}
            >
              <Star
                className={cn(
                  "w-10 h-10 transition-colors",
                  isActive ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-muted-foreground"
                )}
              />
            </button>
          );
        })}
      </div>
      {rating > 0 && (
        <span className="text-sm text-muted-foreground">
          Tu calificación: {rating} de 5 estrellas
        </span>
      )}
    </div>
  );
}
