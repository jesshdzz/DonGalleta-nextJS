import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserFavorites } from "@/actions/favorite-actions";
import { Prisma } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import FavoriteButton from "@/components/ui/favorite-button";
import AddToCartButton from "@/components/carro/AddToCartButton";

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
            <h1>Mis Favoritos</h1>
          </div>
          <p className="max-w-2xl mx-auto">
            Aquí tienes todos los productos que has marcado como favoritos. 
            ¡Añade los que más te gusten al carrito!
          </p>
        </div>

        {/* Lista de Favoritos */}
        <Suspense fallback={<FavoritesSkeleton />}>
          <FavoritesList />
        </Suspense>
      </div>
    </div>
  );
}

async function FavoritesList() {
  const result = await getUserFavorites();

  if (result.error) {
    return (
      <div className="text-center py-16">
        <Heart className="h-16 w-16 text-muted mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">Error al cargar tus favoritos</p>
        <Button asChild>
          <Link href="/productos">Ver Productos</Link>
        </Button>
      </div>
    );
  }

  const favorites = result.favorites || [];

  if (favorites.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="h-16 w-16 text-muted mx-auto mb-4" />
        <h2>
          Aún no tienes favoritos
        </h2>
        <p className="mb-6">
          Explora nuestros productos y marca los que más te gusten
        </p>
        <Button asChild>
          <Link href="/productos">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Explorar Productos
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {favorites.map((favorite) => (
        <FavoriteProductCard 
          key={favorite.id} 
          favorite={favorite} 
        />
      ))}
    </div>
  );
}

interface FavoriteProductCardProps {
  favorite: {
    id: string;
    createdAt: Date;
    product: {
      id: number;
      name: string;
      description: string | null;
      price: Prisma.Decimal; // Decimal from Prisma
      image: string | null;
      stock: number;
      slug: string;
      isActive: boolean;
      flavors: {
        flavor: {
          id: number;
          name: string;
        };
      }[];
    };
  };
}

function FavoriteProductCard({ favorite }: FavoriteProductCardProps) {
  const { product } = favorite;
  const price = parseFloat(product.price.toString());

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
      {/* Imagen del producto */}
      <div className="relative aspect-square overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <ShoppingCart className="h-16 w-16 text-muted" />
          </div>
        )}
        
        {/* Botón de favoritos superpuesto */}
        <div className="absolute top-3 right-3">
          <FavoriteButton
            productId={product.id}
            initialIsFavorite={true}
            size="md"
          />
        </div>

        {/* Badge de stock */}
        {product.stock === 0 && (
          <div className="absolute top-3 left-3">
            <Badge variant="destructive">Sin stock</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Título y descripción */}
        <Link href={`/productos/${product.id}`} className="block hover:text-primary">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2 leading-5">
            {product.description}
          </p>
        )}

        {/* Sabores */}
        {product.flavors.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {product.flavors.slice(0, 3).map((pf) => (
                <Badge key={pf.flavor.id} variant="secondary" className="text-xs">
                  {pf.flavor.name}
                </Badge>
              ))}
              {product.flavors.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{product.flavors.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Precio */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-primary">
            ${price.toFixed(2)}
          </span>
          
          {/* Fecha añadido */}
          <span className="text-xs text-muted-foreground">
            Añadido {new Date(favorite.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <div className="flex-1">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: price,
                stock: product.stock,
                image: product.image
              }}
            />
          </div>
          
          <Button variant="outline" size="icon" asChild>
            <Link href={`/productos/${product.id}`}>
              <ShoppingCart className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FavoritesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="aspect-square bg-gray-200 animate-pulse" />
          <CardContent className="p-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}