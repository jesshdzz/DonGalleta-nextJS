import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/actions/product-actions";

export async function ProductCarousel() {
    const products = await getProducts();
    const featuredProducts = products.slice(0, 4); // Show only first 4 for now

    return (
        <section className="w-full py-12 md:py-24">
            <div className="px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-primary">
                            Productos Destacados
                        </h2>
                        <p className="max-w-225 text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed">
                            Nuestras creaciones favoritas, horneadas diariamente para ti.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {featuredProducts.map((product) => (
                        <Card key={product.id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                            <div className="relative aspect-square overflow-hidden rounded-t-lg">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-300"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                                        Sin imagen
                                    </div>
                                )}
                                {!product.stock && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <Badge variant="destructive" className="text-lg">Agotado</Badge>
                                    </div>
                                )}
                            </div>
                            <CardHeader className="p-4">
                                <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                                <div className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 flex-1">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {product.description || "Sin descripción disponible."}
                                </p>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <Link href={`/productos`} className="w-full">
                                    <Button className="w-full">Ver Detalles</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                <div className="mt-10 flex justify-center">
                    <Link href="/productos">
                        <Button variant="outline" size="lg">Ver Todos los Productos</Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
