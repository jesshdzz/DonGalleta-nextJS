import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
    return (
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-[url('https://images.unsplash.com/photo-1499636138143-bd630f5cf446?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative px-4 md:px-6 flex flex-col items-center text-center space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                    Galletas que <span className="text-destructive">encantan</span>, Sabores que <span className="text-destructive">inspiran:</span> <br className="hidden md:inline" />
                    <span className="text-destructive">hechas a tu medida!</span>
                </h1>
                <p className="mx-auto max-w-175 text-gray-200 md:text-xl">
                    Creamos galletas caseras únicas en una variedad de sabores irresistibles, totalmente personalizables.
                    Disfruta opciones sin gluten, integrales y una sección especial de postres hechos con dedicación para ti.
                </p>
                <div className="space-x-4">
                    <Link href="/productos">
                        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                            Ver Catálogo
                        </Button>
                    </Link>
                    <Link href="/contacto">
                        <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-black">
                            Contáctanos
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
