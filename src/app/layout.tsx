import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "uploadthing/tw/v4";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { auth } from "@/auth";
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