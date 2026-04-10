"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search, ShoppingCart, User, Menu, X, Cookie, Home, Tag, Phone, Loader2, LogOut, Shield, Package, MapPin, Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useCart } from "@/context/CartContext";
import Logo from "@/assets/images/logo.png";
import { shouldHideLayout } from "@/lib/constants";
import { searchProducts } from "@/actions/product-actions";
import { signOut } from "next-auth/react";

type UserSession = { id?: string; name?: string | null; email?: string | null; role?: string } | undefined | null;

type SearchResult = { id: number; name: string; slug: string; price: number; flavor: string; image?: string | null; };

export function Navbar({ user }: { user?: UserSession }) {
  const { totalItems, logoutClearCart } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Función de cierre de sesión mejorada
  const handleLogout = async () => {
    logoutClearCart(); // Limpia la UI pero no la DB
    await signOut({ callbackUrl: "/" });
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim().length > 0) {
      setIsMobileSearchOpen(false);
      setSearchResults([]);
      router.push(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchProducts(searchQuery, 5);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (shouldHideLayout(pathname)) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 relative">
        {/* Mobile Search Overlay */}
        {isMobileSearchOpen && (
          <div className="absolute inset-0 z-50 flex items-center bg-background px-4 md:hidden">
            <div className="relative w-full flex items-center gap-2">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar galletas..."
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                  className="w-full pl-8 pr-4"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileSearchOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Menu (Sheet) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col w-75 p-0">
            <SheetTitle className="sr-only">Menú</SheetTitle>
            <div className="p-6 border-b flex justify-center">
              <SheetClose asChild><Link href="/"><Image src={Logo} alt="Logo" width={120} /></Link></SheetClose>
            </div>
            <nav className="flex-1 flex flex-col gap-2 p-4">
              <SheetClose asChild><Link href="/" className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary"><Home className="size-5" /> Inicio</Link></SheetClose>
              <SheetClose asChild><Link href="/productos" className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary"><Cookie className="size-5" /> Productos</Link></SheetClose>
              {user && (
                <div className="mt-4 border-t pt-4">
                  <button onClick={handleLogout} className="flex items-center gap-4 p-3 rounded-xl text-red-500 w-full text-left">
                    <LogOut className="size-5" /> Cerrar Sesión
                  </button>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="mr-6 flex items-center"><Image src={Logo} alt="Don Galleta" width={140} /></Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-sm items-center relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar galletas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className="w-full pl-8"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileSearchOpen(true)}><Search className="h-5 w-5" /></Button>

          <Link href="/carrito">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && <Badge className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-[10px]">{totalItems}</Badge>}
            </Button>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2"><User className="h-5 w-5" /> {user.name?.split(" ")[0]}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/perfil"><User className="mr-2 h-4 w-4" /> Mi Perfil</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/pedidos"><Package className="mr-2 h-4 w-4" /> Mis Pedidos</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500"><LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
                <Link href="/auth/register"><Button size="sm">Registro</Button></Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}