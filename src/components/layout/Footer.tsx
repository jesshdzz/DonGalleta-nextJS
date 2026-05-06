"use client";

import { memo } from "react"; // Para evitar re-renders
import Link from "next/link";
import { usePathname } from "next/navigation";
import { shouldHideLayout } from "@/lib/constants";
import { Facebook, Instagram } from "lucide-react";

const LINK_STYLES =
  "text-sm text-[#A6A3A2] hover:text-[#58321D] transition-colors duration-200";
const ICON_STYLES =
  "text-[#C69A8F] hover:text-[#58321D] transition-colors duration-200";

function FooterComponent() {
  const pathname = usePathname();

  if (shouldHideLayout(pathname)) return null;

  return (
    <footer
      id="footer-section"
      className="w-full bg-white scroll-mt-16 border-t border-[#A6A3A2] contain-intrinsic-size-[auto_300px]"
    >
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:items-start text-center md:text-left">
          {/* Contacto */}
          <div className="flex-1">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#58321D]">
              Contacto
            </h3>
            <ul className="space-y-2 flex flex-col">
              <li>
                <a href="mailto:hola@dongalleta.com" className={LINK_STYLES}>
                  Email: hola@dongalleta.com
                </a>
              </li>
              <li>
                <a href="tel:+529515502806" className={LINK_STYLES}>
                  Tel: +52 953 209 2440
                </a>
              </li>
              <li>
                <Link href="/contacto" className={LINK_STYLES} prefetch={false}>
                  Contacta con un administrador
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="flex-1">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#58321D]">
              Legal
            </h3>
            <div className="flex flex-col gap-2">
              <Link href="/faq" className={LINK_STYLES}>
                Preguntas Frecuentes
              </Link>
              <Link href="/terminos" className={LINK_STYLES}>
                Términos
              </Link>
              <Link href="/privacidad" className={LINK_STYLES}>
                Privacidad
              </Link>
            </div>
          </div>

          {/* Redes */}
          <div className="flex-1 flex flex-col items-center md:items-start">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#58321D]">
              Síguenos
            </h3>
            <div className="flex gap-6">
              <a
                href="https://facebook.com/dongalleta.mx"
                target="_blank"
                rel="noopener noreferrer"
                className={ICON_STYLES}
              >
                <Facebook className="size-6" />
              </a>
              <a
                href="https://instagram.com/dongalleta.mx"
                target="_blank"
                rel="noopener noreferrer"
                className={ICON_STYLES}
              >
                <Instagram className="size-6" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#A6A3A2] py-6 bg-[#F7DCBE]/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs text-[#58321D] tracking-wide uppercase">
            © 2026 <span className="font-bold">Don Galleta</span> - Grupo FLIJ
          </p>
        </div>
      </div>
    </footer>
  );
}

export const Footer = memo(FooterComponent);