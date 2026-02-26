import ProductFilter from '@/components/ui/filters/ProductsFilter';
import { getFilteredProducts, getFlavors } from '@/actions/product-actions';
import ProductoItem from '@/components/carro/ProductoItem';
import { Cookie } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductosPage({ searchParams }: Props) {
  // 1. Esperamos y leemos los parámetros de la URL
  const params = await searchParams;
  const flavorsParam = params?.flavors;
  const queryParam = params?.q; // Capturamos lo que viene del Navbar

  // 2. Convertimos los datos para TypeScript
  const flavors = typeof flavorsParam === 'string' ? flavorsParam.split(',') : [];
  const query = typeof queryParam === 'string' ? queryParam : "";

  // 3. Pasamos AMBOS filtros a la base de datos
  const [products, availableFlavors] = await Promise.all([
    getFilteredProducts({ flavors, query }), // <-- Pasamos el texto también
    getFlavors()
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
            Buscaste: <span className="font-semibold text-foreground">"{query}"</span>
            <span className="ml-3 bg-secondary/30 text-[#58321D] px-3 py-1 rounded-full text-sm font-bold border border-[#58321D]/20">
              {products.length} resultados
            </span>
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* FILTROS LATERALES */}
        <div className="w-full md:w-64 shrink-0">
          <ProductFilter availableFlavors={availableFlavors} />
        </div>

        {/* CUADRÍCULA O EMPTY STATE */}
        <div className="flex-1">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductoItem key={product.id} product={product} />
              ))}
            </div>
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