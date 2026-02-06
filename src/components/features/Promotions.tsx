import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "lucide-react";

export function Promotions() {
    const promotions = [
        {
            id: 1,
            title: "Pack Degustación",
            description: "Prueba nuestros 6 sabores más populares en un solo pack.",
            discount: "15% OFF",
            code: "DEGUSTA15",
        },
        {
            id: 2,
            title: "Envío Gratis",
            description: "En pedidos superiores a $500.00 MXN.",
            discount: "GRATIS",
            code: "ENVIOGRATIS",
        },
        {
            id: 3,
            title: "Martes de 2x1",
            description: "En todas las galletas clásicas de chispas de chocolate.",
            discount: "2x1",
            code: "NO CODE",
        },
    ];

    return (
        <section className="w-full py-12 md:py-24 bg-secondary/20">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                            Ofertas Especiales
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-primary">
                            Promociones Activas
                        </h2>
                        <p className="max-w-225 text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed">
                            Aprovecha nuestras ofertas exclusivas y disfruta más dulzura por menos.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {promotions.map((promo) => (
                        <Card key={promo.id} className="relative overflow-hidden border-2 border-dashed border-secondary">
                            <div className="absolute top-2 right-2">
                                <Badge variant="destructive" className="text-xs">{promo.discount}</Badge>
                            </div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Tag className="h-5 w-5 text-primary" />
                                    {promo.title}
                                </CardTitle>
                                <CardDescription>{promo.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded bg-muted p-2 text-center font-mono text-sm font-bold tracking-widest">
                                    {promo.code}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="outline">Ver Detalles</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
