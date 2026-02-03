import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google"; 
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {/* <Navbar /> ... */}
        {children}
        {/* <Footer /> ... */}
      </body>
    </html>
  );
}