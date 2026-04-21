"use client";

import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitReview, getUserReview } from "@/actions/review-actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ProductRatingProps {
  productId: number;
}

export function ProductRating({ productId }: ProductRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);

  useEffect(() => {
    async function loadRating() {
      try {
        const review = await getUserReview(productId);
        if (review) {
          setRating(review.rating);
          setComment(review.comment || "");
          setHasReviewed(true);
          if (review.comment) {
            setShowCommentBox(true);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    loadRating();
  }, [productId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Debes seleccionar una calificación");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitReview(productId, rating, comment || undefined);
      if (response.success) {
        toast.success(hasReviewed ? "¡Tu opinión ha sido actualizada!" : "¡Gracias por tu opinión!");
        setHasReviewed(true);
      } else {
        toast.error(response.error || "Ocurrió un error.");
      }
    } catch {
      toast.error("Hubo un problema al guardar tu opinión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-6 border-t border-border">
      <h3 className="font-semibold text-2xl text-primary">
        {hasReviewed ? "Tu opinión" : "¿Qué te pareció este producto?"}
      </h3>
      
      <div className="flex flex-col gap-4">
        {/* Estrellas */}
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
                onClick={() => setRating(star)}
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

        {/* Botón para mostrar campo de comentario */}
        {rating > 0 && !showCommentBox && (
          <Button
            variant="outline"
            onClick={() => setShowCommentBox(true)}
            className="w-fit"
          >
            Agregar comentario (opcional)
          </Button>
        )}

        {/* Campo de comentario */}
        {showCommentBox && (
          <div className="flex flex-col gap-3">
            <Textarea
              placeholder="Cuéntanos qué te pareció el producto... (opcional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-25 resize-none"
              maxLength={500}
              disabled={isSubmitting}
            />
            <span className="text-xs text-muted-foreground">
              {comment.length}/500 caracteres
            </span>
          </div>
        )}

        {/* Botón de envío */}
        {rating > 0 && (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-fit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              hasReviewed ? "Actualizar opinión" : "Publicar opinión"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
