"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Cookie,
  Home,
  Tag,
  Phone,
  Loader2,
  LogOut,
  Shield,
  Package,
  MapPin,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useCart } from "@/context/CartContext";
import Logo from "@/assets/images/logo.png";
import { ProfilePhoto } from "@/components/perfil/ProfilePhoto";
import { shouldHideLayout } from "@/lib/constants";
import { searchProducts } from "@/actions/product-actions";
import { signOut } from "next-auth/react";

type UserSession =
  | {
      id?: string;
      name?: string | null;
      email?: string | null;
      role?: string;
      image?: string | null;
    }
  | undefined
  | null;

type SearchResult = {
  id: number;
  name: string;
  price: number;
  slug: string;
  flavor: string;
  image?: string | null;
};

function SearchDropdownComponent({
  searchQuery,
  isSearching,
  searchResults,
  setSearchQuery,
  setIsMobileSearchOpen,
}: {
  searchQuery: string;
  isSearching: boolean;
  searchResults: SearchResult[];
  setSearchQuery: (q: string) => void;
  setIsMobileSearchOpen: (open: boolean) => void;
}) {
  if (searchQuery.length < 3) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
      {isSearching ? (
        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Buscando...
        </div>
      ) : searchResults.length > 0 ? (
        <ul className="py-2">
          {searchResults.map((product) => (
            <li key={product.id}>
              <Link
                href={`/productos/${product.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                onClick={() => {
                  setSearchQuery("");
                  setIsMobileSearchOpen(false);
                }}
              >
                <Cookie className="h-5 w-5 text-primary" />

                <div className="flex flex-col">
                  <span className="text-sm font-bold">{product.name}</span>
                  <span className="text-xs text-muted-foreground italic">
                    {product.flavor || "Clásica"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
          No encontramos galletas con &quot;{searchQuery}&quot;
        </div>
      )}
    </div>
  );
}

export function Navbar({ user }: { user?: UserSession }) {
  const { totalItems, logoutClearCart } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleLogout = async () => {
    logoutClearCart();
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

                <SearchDropdownComponent
                  searchQuery={searchQuery}
                  isSearching={isSearching}
                  searchResults={searchResults}
                  setSearchQuery={setSearchQuery}
                  setIsMobileSearchOpen={setIsMobileSearchOpen}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSearchOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="flex flex-col w-75 sm:w-87.5 p-0 border-r border-[#A6A3A2]"
          >
            <SheetTitle className="sr-only">Menú</SheetTitle>

            <div className="p-6 border-b border-[#A6A3A2]/30 bg-[#F7DCBE]/10 flex justify-center">
              <SheetClose asChild>
                <Link href="/">
                  <Image
                    src={Logo}
                    alt="Don Galleta Logo"
                    width={140}
                    height={80}
                    className="object-contain drop-shadow-sm"
                  />
                </Link>
              </SheetClose>
            </div>

            <nav className="flex-1 flex flex-col gap-2 p-4 mt-2 overflow-y-auto">
              <SheetClose asChild>
                <Link
                  href="/"
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-lg font-medium text-muted-foreground hover:bg-[#F7DCBE]/40 hover:text-[#58321D] transition-all"
                >
                  <Home className="size-5" />
                  Inicio
                </Link>
              </SheetClose>

              {user && (
                <>
                  <SheetClose asChild>
                    <Link
                      href="/perfil"
                      className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-lg font-medium text-muted-foreground hover:bg-[#F7DCBE]/40 hover:text-[#58321D] transition-all"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border border-[#A6A3A2]/40 bg-[#F7DCBE]">
                        <ProfilePhoto user={{ name: user.name || "", image: user.image || "" }} />
                      </div>
                      Mi Cuenta
                    </Link>
                  </SheetClose>

                  {user.role === "ADMIN" && (
                    <SheetClose asChild>
                      <Link
                        href="/admin/productos"
                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-lg font-bold text-[#58321D] hover:bg-[#F7DCBE]/60 transition-all"
                      >
                        <Shield className="size-5" />
                        Panel Admin
                      </Link>
                    </SheetClose>
                  )}
                </>
              )}

              <SheetClose asChild>
                <Link
                  href="/productos"
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-lg font-medium text-muted-foreground hover:bg-[#F7DCBE]/40 hover:text-[#58321D] transition-all"
                >
                  <Cookie className="size-5" />
                  Productos
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link
                  href="/promociones"
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-lg font-medium text-muted-foreground hover:bg-[#F7DCBE]/40 hover:text-[#58321D] transition-all"
                >
                  <Tag className="size-5" />
                  Promociones
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <button
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-lg font-medium text-muted-foreground hover:bg-[#F7DCBE]/40 hover:text-[#58321D] transition-all w-full text-left"
                  onClick={() => {
                    setTimeout(() => {
                      const footer = document.getElementById("footer-section");
                      if (footer) footer.scrollIntoView({ behavior: "smooth" });
                    }, 150);
                  }}
                >
                  <Phone className="size-5" />
                  Contacto
                </button>
              </SheetClose>

              {user && (
                <div className="mt-4 border-t border-[#A6A3A2]/20 pt-4">
                  <SheetClose asChild>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-lg font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-all w-full text-left"
                    >
                      <LogOut className="size-5" />
                      Cerrar Sesión
                    </button>
                  </SheetClose>
                </div>
              )}
            </nav>

            <div className="p-6 border-t border-[#A6A3A2]/30 bg-[#F7DCBE]/20 mt-auto">
              <p className="text-center text-sm font-bold text-[#58321D]">
                ¡Horneadas con amor! 🍪
              </p>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image src={Logo} alt="Don Galleta Logo" width={150} />
        </Link>

        <div className="hidden md:flex flex-1 max-w-sm items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar galletas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="w-full pl-8"
            />

            <SearchDropdownComponent
              searchQuery={searchQuery}
              isSearching={isSearching}
              searchResults={searchResults}
              setSearchQuery={setSearchQuery}
              setIsMobileSearchOpen={setIsMobileSearchOpen}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          <Link href="/carrito">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-[10px]">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {/* DESKTOP AUTH (AQUÍ ESTÁ LA MAGIA DEL DROPDOWN) */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 focus-visible:ring-0 px-2"
                  >
                    <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden border border-[#A6A3A2]/40 bg-[#F7DCBE]">
                      <ProfilePhoto user={{ name: user.name || "", image: user.image || "" }} />
                    </div>
                    <span className="font-medium">
                      {user.name?.split(" ")[0] || "Mi Cuenta"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 mt-1">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Opciones de Cliente */}
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="w-full cursor-pointer">
                      <User className="mr-2 h-4 w-4" /> Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/pedidos" className="w-full cursor-pointer">
                      <Package className="mr-2 h-4 w-4" /> Mis Pedidos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favoritos" className="w-full cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" /> Mis Favoritos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/perfil#sucursales" className="w-full cursor-pointer">
                      <MapPin className="mr-2 h-4 w-4" /> Mis Sucursales
                    </Link>
                  </DropdownMenuItem>

                  {/* Panel de Admin (Condicionado) */}
                  {user.role === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[#58321D]">
                        Administración
                      </DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin"
                          className="w-full cursor-pointer font-medium"
                        >
                          <Shield className="mr-2 h-4 w-4 text-[#58321D]" />{" "}
                          Panel Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />

                  {/* Botón de Cerrar Sesión */}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>

                <Link href="/auth/register">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </>
            )}
          </div>

          {/* AUTH MOBILE */}
          <div className="md:hidden">
            {user ? (
              <Link href="/perfil">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <div className="h-8 w-8 rounded-full overflow-hidden border border-[#A6A3A2]/40 bg-[#F7DCBE]">
                    <ProfilePhoto user={{ name: user.name || "", image: user.image || "" }} />
                  </div>
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
