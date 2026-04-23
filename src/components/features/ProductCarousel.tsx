import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/actions/product-actions";
import { getUserFavoriteIds } from "@/actions/favorite-actions";
import AddToCartCarousel from "@/components/carro/AddToCartCarousel";
import FavoriteButton from "@/components/ui/favorite-button";

export async function ProductCarousel() {
    const [products, { favoriteIds }] = await Promise.all([
        getProducts(),
        getUserFavoriteIds()
    ]);

    const featuredProducts = products.slice(0, 4);

    return (
        <section className="w-full py-12 md:py-24">
            <div className="px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                            Nuestros Productos
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-primary">
                            Productos Destacados
                        </h2>
                        <p className="max-w-xl text-muted-foreground md:text-lg/relaxed">
                            Nuestras creaciones favoritas, horneadas diariamente para ti.
                        </p>
                    </div>
                </div>

                {/* Grid ajustado para responsive */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {featuredProducts.map((product) => (
                        <Card key={product.id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 group overflow-hidden">

                            {/* Imagen */}
                            <div className="relative aspect-square overflow-hidden bg-secondary/30">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground text-xs font-medium">
                                        Sin imagen
                                    </div>
                                )}

                                {/* Botón de favoritos */}
                                <div className="absolute top-2 right-2">
                                    <FavoriteButton
                                        productId={product.id}
                                        initialIsFavorite={favoriteIds.includes(product.id)}
                                        size="sm"
                                        variant="ghost"
                                    />
                                </div>

                                {!product.stock && (
                                    <div className="absolute top-2 right-2 z-10">
                                        <Badge variant="destructive" className="shadow-sm text-[10px] sm:text-xs px-1.5 py-0 sm:px-2.5 sm:py-0.5">Agotado</Badge>
                                    </div>
                                )}
                            </div>

                            <CardContent className="grow p-3 sm:p-5 space-y-1 sm:space-y-2">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="font-semibold text-sm sm:text-lg leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                        {product.name}
                                    </h3>
                                </div>
                                <div className="pt-1 sm:pt-2">
                                    <span className="text-lg sm:text-2xl font-bold text-primary">
                                        ${product.price.toFixed(2)}
                                    </span>
                                </div>
                            </CardContent>

                            <div className="px-3 sm:px-5 pb-0 sm:pb-1 w-full">
                                {product.stock > 0 ? (
                                    <AddToCartCarousel product={{ ...product }} />
                                ) : (
                                    <Button disabled size="sm" className="w-full opacity-80 h-9 sm:h-11" variant="secondary">
                                        No disponible
                                    </Button>
                                )}
                            </div>

                            {/* Footer con Ver Detalles - Con su margen negativo para acercarlo */}
                            <CardFooter className="p-3 sm:p-5 pt-0 sm:pt-0 -mt-2 sm:-mt-1">
                                <Link href={`/productos/${product.id}`} className="w-full block">
                                    <Button className="w-full font-bold shadow-sm h-9 sm:h-11 text-xs sm:text-base" variant="secondary">
                                        Ver Detalles
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    <Link href="/productos">
                        <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                            Ver Todos los Productos
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}