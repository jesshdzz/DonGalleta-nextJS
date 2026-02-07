"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";

export function Navbar() {
    const { totalItems } = useCart();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <nav className="grid gap-6 text-lg font-medium">
                            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                                <span className="text-primary">Don Galleta</span>
                            </Link>
                            <Link href="/" className="hover:text-primary">Inicio</Link>
                            <Link href="/productos" className="hover:text-primary">Productos</Link>
                            <Link href="/promociones" className="hover:text-primary">Promociones</Link>
                            <Link href="/contacto" className="hover:text-primary">Contacto</Link>
                        </nav>
                    </SheetContent>
                </Sheet>

                {/* Logo */}
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <span className="hidden font-bold sm:inline-block text-xl">
                        Don <span className="text-primary">Galleta</span>
                    </span>
                </Link>

                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex flex-1 max-w-sm items-center space-x-2">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar galletas..."
                            className="w-full pl-8 bg-background"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Search Button (Mobile) */}
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Buscar</span>
                    </Button>

                    {/* Cart */}
                    <Link href="/carrito">
                        <Button variant="ghost" size="icon" className="relative">
                            <ShoppingCart className="h-5 w-5" />
                            {totalItems > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-[10px]"
                                >
                                    {totalItems}
                                </Badge>
                            )}
                            <span className="sr-only">Carrito de compras</span>
                        </Button>
                    </Link>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">
                                Iniciar Sesión
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm">Registrarse</Button>
                        </Link>
                    </div>
                    {/* Mobile Auth (Icon) */}
                    <Link href="/login" className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <User className="h-5 w-5" />
                        </Button>
                    </Link>

                </div>
            </div>
        </header>
    );
}
