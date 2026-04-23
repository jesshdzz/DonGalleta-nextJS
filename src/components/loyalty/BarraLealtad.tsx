"use client";

import { useEffect, useState } from "react";
import { obtenerProgresoLealtad } from "@/actions/loyalty-actions";
import { Loader2 } from "lucide-react";

export default function BarraLealtad() {
  const [loading, setLoading] = useState(true);
  const [progreso, setProgreso] = useState(0);
  const [siguienteUmbral, setSiguienteUmbral] = useState<number | null>(null);
  const [faltan, setFaltan] = useState(0);

  useEffect(() => {
    cargarProgreso();
  }, []);

  const cargarProgreso = async () => {
    setLoading(true);
    const resultado = await obtenerProgresoLealtad();
    if (resultado.success) {
      setProgreso(resultado.progreso);
      setSiguienteUmbral(resultado.siguienteUmbral);
      setFaltan(resultado.faltan);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const umbrales = [
    { valor: 50, descuento: "10%" },
    { valor: 75, descuento: "20%" },
    { valor: 100, descuento: "40%" },
  ];

  return (
    <div className="space-y-4 w-full">
      {/* Título y estado */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Programa de Lealtad</h3>
          <p className="text-sm text-muted-foreground">
            {siguienteUmbral
              ? `Te faltan ${faltan.toFixed(1)}% para desbloquear el siguiente cupón`
              : "¡Alcanzaste el máximo nivel!"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{progreso.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Progreso</p>
        </div>
      </div>

      {/* Barra de progreso visual */}
      <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
        {/* Relleno del progreso */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(progreso, 100)}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>

        {/* Marcadores de umbrales */}
        {umbrales.map((umbral) => {
          const alcanzado = progreso >= umbral.valor;
          return (
            <div
              key={umbral.valor}
              className="absolute top-0 h-full flex flex-col items-center justify-center"
              style={{ left: `${umbral.valor}%`, transform: "translateX(-50%)" }}
            >
              {/* Línea vertical */}
              <div
                className={`w-0.5 h-full ${
                  alcanzado ? "bg-white" : "bg-gray-400"
                }`}
              />
              
              {/* Círculo marcador */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 ${
                  alcanzado
                    ? "bg-white border-white shadow-lg"
                    : "bg-gray-200 border-gray-400"
                }`}
              />

              {/* Etiqueta del umbral */}
              <div className="absolute -top-8 whitespace-nowrap">
                <p
                  className={`text-xs font-bold ${
                    alcanzado ? "text-primary" : "text-gray-500"
                  }`}
                >
                  {umbral.descuento}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda de umbrales */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        {umbrales.map((umbral) => {
          const alcanzado = progreso >= umbral.valor;
          return (
            <div
              key={umbral.valor}
              className={`p-2 rounded border ${
                alcanzado
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-gray-50 border-gray-200 text-gray-500"
              }`}
            >
              <p className="font-semibold">{umbral.valor}%</p>
              <p>{umbral.descuento} descuento</p>
              {alcanzado && <p className="text-xs mt-1">✓ Desbloqueado</p>}
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 <strong>¿Cómo funciona?</strong> Por cada $1 MXN que gastes, acumulas 1% en tu barra.
          Al alcanzar 50%, 75% o 100%, desbloqueas un cupón de descuento que puedes usar en tu próxima compra.
        </p>
      </div>
    </div>
  );
}
