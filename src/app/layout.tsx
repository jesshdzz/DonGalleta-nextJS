import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "uploadthing/tw/v4";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { Providers } from "@/components/Providers";
import { AdminNotificationProvider } from "@/components/admin/AdminNotificationProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans", // Variable CSS para Tailwind
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif", // Variable CSS para Tailwind
});

export const metadata: Metadata = {
  title: "Don Galleta | La mejor repostería",
  description: "Compra las mejores galletas artesanales en línea.",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  // Aseguramos que la foto del Navbar siempre esté sincronizada con la BD
  // sin importar que la cookie de NextAuth esté desactualizada.
  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });
    if (dbUser) {
      session.user.image = dbUser.image;
    }
  }

  return (
    <html lang="es">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <Providers>
          <AdminNotificationProvider>
            <CartProvider>
              <Navbar user={session?.user} />
              <main className="flex-1">
                {children}
              </main>
              <Toaster />
              <Footer />
            </CartProvider>
          </AdminNotificationProvider>
        </Providers>
      </body>
    </html>
  );
}