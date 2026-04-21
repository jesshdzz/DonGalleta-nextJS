import { Star, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface ReviewListProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export function ReviewList({ reviews, averageRating, totalReviews }: ReviewListProps) {
  if (totalReviews === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          Este producto aún no tiene opiniones. ¡Sé el primero en opinar!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de calificaciones */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <div className="flex flex-col items-center gap-1">
          <div className="text-4xl font-bold text-primary">{averageRating}</div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-4 h-4",
                  star <= Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-transparent text-muted-foreground"
                )}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {totalReviews} {totalReviews === 1 ? "opinión" : "opiniones"}
          </p>
        </div>
      </div>

      {/* Lista de opiniones */}
      <div className="space-y-4">
        <h3 className="font-semibold text-xl text-primary">
          Opiniones de clientes
        </h3>
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.user.image || undefined} />
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>

                  {/* Contenido */}
                  <div className="flex-1 space-y-2">
                    {/* Nombre y fecha */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">
                          {review.user.name || "Usuario anónimo"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      {/* Estrellas */}
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-4 h-4",
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-transparent text-muted-foreground"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Comentario */}
                    {review.comment && (
                      <p className="text-sm text-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
