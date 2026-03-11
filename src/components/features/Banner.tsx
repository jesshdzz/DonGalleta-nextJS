"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
// Definimos la estructura de lo que necesita cada banner
export interface BannerItem {
  id: number;
  image: string;
  alt: string;
}

interface BannerProps {
  banners: BannerItem[];
  autoPlayInterval?: number; // Tiempo en milisegundos
}

export default function Banner({
  banners,
  autoPlayInterval = 5000,
}: BannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Función para avanzar (memoizada para no causar re-renders innecesarios en el useEffect)
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1,
    );
  }, [banners.length]);

  // Función para retroceder
  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1,
    );
  };

  // Función para ir a un slide específico desde los puntitos
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Efecto para el Autoplay
  useEffect(() => {
    if (banners.length <= 1) return; // Si solo hay 1 banner, no hacemos autoplay

    const timer = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timer); // Limpiamos el intervalo al desmontar o cambiar
  }, [nextSlide, autoPlayInterval, banners.length]);

  if (!banners || banners.length === 0) return null;

  return (
    // group: nos permite detectar el hover en todo el contenedor para mostrar las flechas
    <div className="relative w-full overflow-hidden group bg-secondary/20 rounded-lg">
      {/* 1. Contenedor de Imágenes con animación de deslizamiento */}
      {/* Alturas dinámicas: 200px (móvil), 300px (tablet), 400px (escritorio) */}
      <div
        className="flex transition-transform duration-500 ease-out h-[200px] sm:h-[300px] md:h-[400px] lg:h-[450px]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={banner.id} className="relative w-full h-full shrink-0">
            <Image
              src={banner.image}
              alt={banner.alt}
              fill
              className="object-cover"
              // Solo la primera imagen carga de inmediato, las demás tienen lazy loading nativo
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* 2. Flecha Izquierda */}
      {banners.length > 1 && (
        <Button
          variant="secondary"
          size="icon"
          onClick={prevSlide}
          // CAMBIO: opacity-70 en móvil, en sm (desktop) se esconden y aparecen en hover
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/90 text-foreground rounded-full shadow-sm transition-opacity duration-300 opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="Anterior banner"
        >
          <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
        </Button>
      )}

      {/* 3. Flecha Derecha */}
      {banners.length > 1 && (
        <Button
          variant="secondary"
          size="icon"
          onClick={nextSlide}
          // CAMBIO: Igual aquí, opacity-70 por defecto para que se vean en celular
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/90 text-foreground rounded-full shadow-sm transition-opacity duration-300 opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="Siguiente banner"
        >
          <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
        </Button>
      )}
      {/* 4. Puntitos Inferiores (Dots) */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-background/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? "bg-primary w-6" // El dot activo se alarga un poco (efecto píldora)
                  : "bg-primary/50 w-2.5 hover:bg-primary/80"
              }`}
              aria-label={`Ir al banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
