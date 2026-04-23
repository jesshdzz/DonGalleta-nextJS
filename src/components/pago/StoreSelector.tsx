"use client";

import { useEffect, useRef, useState } from "react";
import { Store } from "@prisma/client";
import { Store as StoreIcon, Star, MapPin, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { getUserFavoriteStores } from "@/actions/favorite-store-actions";
import { getStores } from "@/actions/store-actions";

interface Props {
  selectedStoreId: string | null;
  onStoreSelect: (id: string) => void;
}

export function StoreSelector({ selectedStoreId, onStoreSelect }: Props) {
  const [stores, setStores] = useState<Store[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showAllStores, setShowAllStores] = useState(false);

  const onStoreSelectRef = useRef(onStoreSelect);
  const selectedStoreIdRef = useRef(selectedStoreId);
  useEffect(() => {
    onStoreSelectRef.current = onStoreSelect;
    selectedStoreIdRef.current = selectedStoreId;
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [allStores, favoritesRes] = await Promise.all([
          getStores(),
          getUserFavoriteStores(),
        ]);

        const activeStores = allStores.filter(s => s.isActive);

        let favSet = new Set<string>();
        if (favoritesRes.success && favoritesRes.favorites) {
          favSet = new Set(favoritesRes.favorites.map((f: { storeId: string }) => f.storeId));
          setFavoriteIds(favSet);

          activeStores.sort((a, b) => {
            const aFav = favSet.has(a.id);
            const bFav = favSet.has(b.id);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return a.name.localeCompare(b.name);
          });
        }

        setStores(activeStores);

        // Auto-seleccionar la primera sucursal favorita (o la primera disponible)
        if (!selectedStoreIdRef.current && activeStores.length > 0) {
          const firstFav = activeStores.find(s => favSet.has(s.id));
          setTimeout(() => onStoreSelectRef.current((firstFav ?? activeStores[0]).id), 0);
        }
      } catch (error) {
        console.error("Error cargando sucursales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse h-24 bg-muted/50 rounded-md mb-6"></div>;
  }

  if (stores.length === 0) {
    return (
      <div className="mb-6 p-4 border border-destructive/50 bg-destructive/10 rounded-md text-destructive text-sm text-center">
        No hay sucursales disponibles para recoger pedidos en este momento.
      </div>
    );
  }

  const favoriteStores = stores.filter(store => favoriteIds.has(store.id));
  const otherStores = stores.filter(store => !favoriteIds.has(store.id));
  const displayedStores = showAllStores ? stores : favoriteStores;

  return (
    <div className="space-y-4 mb-6">
      <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
        <StoreIcon className="h-5 w-5 text-primary" />
        ¿En qué sucursal recogerás tu pedido?
      </h3>

      {favoriteStores.length === 0 && !showAllStores && (
        <div className="p-4 border border-border/60 bg-secondary/10 rounded-md text-sm text-center">
          No tienes sucursales favoritas guardadas.
          <Button variant="link" className="px-1 text-primary" onClick={() => setShowAllStores(true)}>
            Ver todas las sucursales
          </Button>
        </div>
      )}

      {displayedStores.length > 0 && (
        <RadioGroup
          value={selectedStoreId || ""}
          onValueChange={onStoreSelect}
          className="grid gap-3"
        >
          {displayedStores.map((store) => {
            const isFav = favoriteIds.has(store.id);
            const isSelected = selectedStoreId === store.id;

            return (
              <div
                key={store.id}
                className={`relative flex items-start space-x-3 rounded-md border p-3 cursor-pointer transition-colors ${isSelected ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" : "border-border hover:border-primary/30 hover:shadow-sm"}`}
              >
                <RadioGroupItem value={store.id} id={store.id} className="mt-1" />
                <Label htmlFor={store.id} className="flex-1 cursor-pointer font-normal pr-6">
                  <div>
                    <div className="flex items-center my-1">
                      <span className="font-medium text-foreground">{store.name}</span>
                    </div>

                    <div className="flex flex-row">
                      <span className="text-xs text-muted-foreground flex items-start gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>{store.address}</span>
                      </span>
                    </div>

                    {store.schedule && (
                      <span className="text-xs text-muted-foreground flex items-start gap-1 mt-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{store.schedule}</span>
                      </span>
                    )}
                  </div>
                </Label>

                {isFav && (
                  <div className="absolute top-3 right-3 flex items-center justify-center text-primary" title="Sucursal Favorita">
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                )}
              </div>
            );
          })}
        </RadioGroup>
      )}

      {otherStores.length > 0 && favoriteStores.length > 0 && (
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-primary mt-2"
          onClick={() => setShowAllStores(!showAllStores)}
        >
          {showAllStores ? (
            <>Ocultar sucursales <ChevronUp className="ml-2 h-4 w-4" /></>
          ) : (
            <>Mostrar todas las sucursales ({otherStores.length}) <ChevronDown className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      )}
    </div>
  );
}
