import ProductFilter from '@/components/ui/filters/ProductsFilter';
import { getFilteredProducts } from '@/actions/product-actions';
import { getFlavors } from '@/actions/flavor-actions';
import { getUserFavoriteIds } from '@/actions/favorite-actions';
import { getProductIdsWithActivePromotion } from '@/actions/promotion-actions';
import ProductoItem from '@/components/carro/ProductoItem';
import { Cookie } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from 'react';
import { PaginationControls } from "@/components/ui/pagination-controls";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductosPage({ searchParams }: Props) {
  // 1. Esperamos y leemos los parámetros de la URL
  const params = await searchParams;
  const flavorsParam = params?.flavors;
  const queryParam = params?.q; // Capturamos lo que viene del Navbar
  const pageParam = params?.page;

  // 2. Convertimos los datos para TypeScript
  const flavors = typeof flavorsParam === 'string' ? flavorsParam.split(',') : [];
  const query = typeof queryParam === 'string' ? queryParam : "";
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) || 1 : 1;

  // 3. Pasamos AMBOS filtros a la base de datos + consultamos favoritos
  const [{ products, totalPages, currentPage }, availableFlavors, { favoriteIds }, { hasGlobal: hasGlobalPromo, ids: promoProductIds }] = await Promise.all([
    getFilteredProducts({ flavors, query, page, pageSize: 12 }),
    getFlavors(),
    getUserFavoriteIds(),
    getProductIdsWithActivePromotion(),
  ]);

  return (
    <div className="max-w-7xl mx-auto p-4 min-h-screen">

      {/* CABECERA DINÁMICA */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-4xl font-serif font-bold text-primary mb-2">
          {query ? "Resultados de búsqueda" : "Nuestros Productos"}
        </h1>
        {query && (
          <p className="text-muted-foreground text-lg">
            Buscaste: <span className="font-semibold text-foreground">&quot;{query}&quot;</span>
            <span className="ml-3 bg-secondary/30 text-[#58321D] px-3 py-1 rounded-full text-sm font-bold border border-[#58321D]/20">
              {products.length} resultados
            </span>
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        {/* FILTROS LATERALES */}
        <div className="w-full md:w-64 shrink-0">
          <Suspense fallback={<div>Cargando filtros...</div>}>
            <ProductFilter availableFlavors={availableFlavors} />
          </Suspense>
        </div>

        {/* CUADRÍCULA O EMPTY STATE */}
        <div className="flex-1">
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductoItem
                    key={product.id}
                    product={product}
                    initialIsFavorite={favoriteIds.includes(product.id)}
                    hasPromotion={hasGlobalPromo || promoProductIds.has(product.id)}
                  />
                ))}
              </div>
              <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/productos"
                searchParams={params as Record<string, string | string[]>}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-secondary/10 border-2 border-dashed border-border rounded-xl">
              <Cookie className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-bold text-primary mb-2">¡Ups! No hay galletas aquí</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                {query
                  ? `No encontramos ninguna galleta que coincida con "${query}".`
                  : "No se encontraron productos con los filtros seleccionados."}
              </p>

              {/* Botón para limpiar si el usuario se quedó sin resultados */}
              {(query || flavors.length > 0) && (
                <Link href="/productos">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                    Limpiar filtros y búsqueda
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}