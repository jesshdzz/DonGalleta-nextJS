import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl mx-auto text-center w-full">
        {/* Ilustración de galleta mordida */}
        <div className="mb-10 flex justify-center animate-in zoom-in duration-500">
          <div className="relative">
            {/* Galleta principal */}
            <div className="w-32 h-32 bg-amber-200 rounded-full border-4 border-amber-300 shadow-lg relative overflow-hidden">
              {/* Chispas de chocolate */}
              <div className="absolute top-4 left-6 w-3 h-3 bg-amber-800 rounded-full"></div>
              <div className="absolute top-8 right-8 w-2 h-2 bg-amber-900 rounded-full"></div>
              <div className="absolute bottom-6 left-8 w-2 h-2 bg-amber-800 rounded-full"></div>
              <div className="absolute bottom-4 right-6 w-3 h-3 bg-amber-900 rounded-full"></div>
              <div className="absolute top-6 left-1/2 w-2 h-2 bg-amber-700 rounded-full"></div>

              {/* Mordida - círculo recortado */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-background rounded-full border-4 border-background"></div>

              {/* Textura de galleta */}
              <div className="absolute inset-0 bg-linear-to-br from-amber-100 to-amber-200 opacity-50 rounded-full"></div>
            </div>

            {/* Migas de galleta */}
            <div className="absolute -bottom-2 right-2 flex space-x-1">
              <div className="w-2 h-2 bg-amber-200 rounded-full"></div>
              <div className="w-1 h-1 bg-amber-300 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-amber-200 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Contenido textual */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-8xl font-bold text-primary font-serif drop-shadow-sm pb-10">
              404
            </h1>
            <h2 className="text-3xl font-semibold text-foreground font-serif">
              ¡Ups! Esta página se comió una galleta
            </h2>
          </div>

          <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
            Parece que la página que buscas no existe o se ha movido.
            ¡No te preocupes, te llevamos de vuelta a casa!
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button asChild size="lg" className="font-bold shadow-md hover:shadow-lg transition-all">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Volver al Inicio
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="font-bold border-primary/20 hover:bg-primary/5">
              <Link href="/productos" className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Ver Productos
              </Link>
            </Button>
          </div>

          {/* Sugerencias adicionales */}
          <div className="pt-10 border-t border-border mt-10">
            <p className="text-muted-foreground text-sm mb-4">
              ¿Necesitas ayuda? Prueba con estas opciones:
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
              <Link
                href="/productos"
                className="text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Nuestros Productos
              </Link>
              <span className="text-muted-foreground/30">•</span>
              <Link
                href="/contacto"
                className="text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Contacto
              </Link>
              <span className="text-muted-foreground/30">•</span>
              <Link
                href="/auth/login"
                className="text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>

        {/* Decoración adicional */}
        <div className="absolute top-10 left-10 opacity-20 pointer-events-none">
          <div className="w-6 h-6 bg-primary/30 rounded-full"></div>
        </div>
        <div className="absolute bottom-10 right-10 opacity-20 pointer-events-none">
          <div className="w-4 h-4 bg-primary/40 rounded-full"></div>
        </div>
        <div className="absolute top-1/4 right-20 opacity-20 pointer-events-none">
          <div className="w-3 h-3 bg-primary/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}