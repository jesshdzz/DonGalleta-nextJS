import AddToCartButton from "@/app/components/AddToCartButton";
import Image from "next/image";
import Link from "next/link";

async function getProduct(id: string) {
  const res = await fetch(`http://localhost:3000/api/products/${id}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch product');
  }
  
  return res.json();
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  return (
    <div className="w-full min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/productos" className="text-blue-500 hover:underline mb-4 inline-block">
          ← Volver a productos
        </Link>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <div className="relative h-96 rounded-xl overflow-hidden">
              <Image
                src={product.image_url || "/placeholder-product.jpg"}
                alt={product.name}
                className="w-full h-full object-cover"
                fill
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-pink-500 mb-4">
              ${product.price.toFixed(2)}
            </p>
            
            <p className="text-gray-700 mb-6">{product.description}</p>
            
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                product.quantity > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.quantity > 0 ? 'En stock' : 'Agotado'}
              </span>
            </div>
            
            {product.quantity > 0 && (
              <AddToCartButton product={product} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}