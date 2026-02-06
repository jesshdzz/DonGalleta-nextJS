import ProductFilter from '@/components/ui/filters/ProductsFilter';
import { getFilteredProducts } from '@/actions/product-actions';
import ProductoItem from '@/components/carro/ProductoItem';

export default async function ProductosPage({ searchParams }: any) {
  const params = await searchParams;
  const flavors = params?.flavors?.split(',') ?? [];

  const products = await getFilteredProducts({ flavors });

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Productos</h1>
      <div className="flex gap-6">
        <ProductFilter />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
          {products.map((product) => (
            <ProductoItem key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
