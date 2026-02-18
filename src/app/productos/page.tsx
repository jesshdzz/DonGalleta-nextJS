import ProductFilter from '@/components/ui/filters/ProductsFilter';
import { getFilteredProducts, getFlavors } from '@/actions/product-actions';
import ProductoItem from '@/components/carro/ProductoItem';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductosPage({ searchParams }: Props) {
  const params = await searchParams;
  const flavorsParam = params?.flavors;

  // Convertir string | string[] | undefined a string[]
  const flavors = typeof flavorsParam === 'string'
    ? flavorsParam.split(',')
    : [];

  const [products, availableFlavors] = await Promise.all([
    getFilteredProducts({ flavors }),
    getFlavors()
  ]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-4xl font-serif font-bold mb-8 text-center text-primary">Nuestros Productos</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-auto">
          <ProductFilter availableFlavors={availableFlavors} />
        </div>

        <div className="flex-1">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductoItem key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
              <p className="text-lg">No se encontraron productos con los filtros seleccionados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
