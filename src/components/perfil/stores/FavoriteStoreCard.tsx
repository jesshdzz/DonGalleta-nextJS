"use client";

import { Store } from "@prisma/client";
import { Store as StoreIcon, Star, Phone, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toggleFavoriteStore } from "@/actions/favorite-store-actions";
import { toast } from "sonner";
import { useState } from "react";

interface Props {
  store: Store;
  isFavorite: boolean;
  onUpdate: () => void;
}

export function FavoriteStoreCard({ store, isFavorite, onUpdate }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFavorite = async () => {
    setIsLoading(true);
    const res = await toggleFavoriteStore(store.id);
    if (res.success) {
      toast.success(res.isFavorite ? "Sucursal agregada a favoritas" : "Sucursal eliminada de favoritas");
      onUpdate();
    } else {
      toast.error(res.error || "Ocurrió un error");
    }
    setIsLoading(false);
  };

  return (
    <Card className={`relative overflow-hidden transition-all ${isFavorite ? 'border-primary/50 shadow-md ring-1 ring-primary/20' : 'border-border/50 hover:border-primary/30 hover:shadow-sm'}`}>
      
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className={`mt-1 p-2 rounded-full shrink-0 ${isFavorite ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
            <StoreIcon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 space-y-1.5 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-foreground truncate">
                {store.name}
              </h4>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 shrink-0 ${isFavorite ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50' : 'text-muted-foreground hover:text-primary'}`}
                onClick={handleToggleFavorite}
                disabled={isLoading}
              >
                <Star className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed flex items-start gap-1">
              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{store.address}</span>
            </p>

            {store.schedule && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {store.schedule}
              </p>
            )}

            {store.phone && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {store.phone}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
