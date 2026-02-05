import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co', // Para las imágenes por defecto
      },
      {
        protocol: 'https',
        hostname: '**', // (Opcional) Usa esto si vas a cargar imágenes de cualquier sitio en desarrollo
      }
    ],
  },
};

export default nextConfig;
