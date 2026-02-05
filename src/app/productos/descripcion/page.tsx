// app/bodega/page.tsx
import ProductoItem from "@/components/carro/ProductoItem";

async function getProducts() {
  const res = await fetch('http://localhost:3000/api/products', {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  
  return res.json();
}

export default async function ProductosPage() {
  const products = await getProducts();

  return (
    <div className="w-full min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">Productos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {products.map((product: any) => (
            <ProductoItem key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}