"use client";

import { useEffect, useState } from "react";
import { obtenerCuponesLealtadDisponibles } from "@/actions/loyalty-actions";
import { Button } from "@/components/ui/button";
import { Loader2, Gift, Lock } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onSeleccionarCupon: (codigo: string) => void;
  cuponAplicado?: string | null;
}

export default function SelectorCuponesLealtad({ onSeleccionarCupon, cuponAplicado }: Props) {
  const [loading, setLoading] = useState(true);
  const [cupones, setCupones] = useState<Record<string, { code: string } | null>>({
    "10": null,
    "20": null,
    "40": null,
  });

  useEffect(() => {
    const cargarCupones = async () => {
      const resultado = await obtenerCuponesLealtadDisponibles();
      if (resultado.success) {
        if (resultado.cupones) {
        setCupones(resultado.cupones);
      }
      }
      setLoading(false);
    };

    cargarCupones();
  }, []);

  const manejarSeleccion = (codigo: string | null, descuento: string) => {
    if (!codigo) {
      toast.error(`Cupón de ${descuento} no disponible`, {
        description: "Completa tu barra de lealtad para desbloquearlo",
      });
      return;
    }

    onSeleccionarCupon(codigo);
    toast.success(`Cupón de ${descuento} seleccionado`, {
      description: "El código se aplicó automáticamente",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  const opciones = [
    { descuento: "10%", cupon: cupones["10"], valor: "10" },
    { descuento: "20%", cupon: cupones["20"], valor: "20" },
    { descuento: "40%", cupon: cupones["40"], valor: "40" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-sm mb-0">Cupones de Lealtad</h4>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {opciones.map((opcion) => {
          const disponible = !!opcion.cupon;
          const seleccionado = cuponAplicado === opcion.cupon?.code;

          return (
            <Button
              key={opcion.valor}
              variant={seleccionado ? "default" : disponible ? "outline" : "ghost"}
              className={`h-auto py-3 flex flex-col items-center gap-1 relative transition-all ${
                disponible
                  ? "border-2 border-primary/50 hover:border-primary hover:bg-primary/5"
                  : "border border-gray-200 opacity-50 cursor-not-allowed"
              } ${seleccionado ? "ring-2 ring-primary ring-offset-2" : ""}`}
              disabled={!disponible || seleccionado}
              onClick={() => manejarSeleccion(opcion.cupon?.code || null, opcion.descuento)}
            >
              {!disponible && (
                <Lock className="absolute top-2 right-2 w-3 h-3 text-gray-400" />
              )}
              
              <span className={`text-xl font-bold ${disponible ? "text-primary" : "text-gray-400"}`}>
                {opcion.descuento}
              </span>
              
              <span className={`text-xs ${disponible ? "text-muted-foreground" : "text-gray-400"}`}>
                {disponible ? "Disponible" : "Bloqueado"}
              </span>

              {seleccionado && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                  ✓
                </span>
              )}
            </Button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-2">
        {cupones["10"] || cupones["20"] || cupones["40"]
          ? "Selecciona un cupón para aplicar el descuento"
          : "Completa compras para desbloquear cupones de descuento"}
      </p>
    </div>
  );
}
