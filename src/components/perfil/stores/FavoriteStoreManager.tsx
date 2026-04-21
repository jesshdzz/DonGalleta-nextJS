"use client";

import { useEffect, useState } from "react";
import { Store } from "@prisma/client";
import { Store as StoreIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserFavoriteStores } from "@/actions/favorite-store-actions";
import { FavoriteStoreCard } from "./FavoriteStoreCard";

export function FavoriteStoreManager() {
  const [stores, setStores] = useState<Store[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // getUserFavoriteStores ya incluye `store: true` en su query de Prisma,
      // no necesitamos llamar a getStores() por separado.
      const favoritesRes = await getUserFavoriteStores();

      if (favoritesRes.success && favoritesRes.favorites) {
        const favSet = new Set<string>(favoritesRes.favorites.map((f: { storeId: string }) => f.storeId));
        setFavoriteIds(favSet);
        // Extraemos directamente los objetos Store del include
        setStores(favoritesRes.favorites.map((f: { store: Store }) => f.store));
      } else {
        setStores([]);
      }
    } catch (error) {
      console.error("Error cargando sucursales:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Card id="sucursales" className="border-[#A6A3A2]/40 shadow-sm mt-8 scroll-mt-24">
      <CardHeader className="pb-4">
        <div>
          <CardTitle className="text-xl text-[#58321D] flex items-center gap-2">
            <StoreIcon className="h-5 w-5" />
            Mis Sucursales Favoritas
          </CardTitle>
          <CardDescription>
            Marca tus puntos de venta preferidos para seleccionarlos rápidamente al realizar un pedido para recoger.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          </div>
        ) : stores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map((store) => (
              <FavoriteStoreCard
                key={store.id}
                store={store}
                isFavorite={favoriteIds.has(store.id)}
                onUpdate={loadData}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 border-2 border-dashed border-border/60 rounded-lg bg-secondary/10">
            <div className="bg-background w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-border/50">
              <StoreIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">Aún no tienes sucursales favoritas</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
              Añade direcciones favoritas aquí para seleccionarlas rápidamente en tus pedidos.
            </p>
            <Button variant="outline" asChild>
              <a href="/#mapa-sucursales">Ver mapa de sucursales</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
