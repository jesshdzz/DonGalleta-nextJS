"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface CartItemRowProps {
    item: {
        productId: number;
        name: string;
        price: number;
        image: string;
        quantity: number;
        availableQuantity: number;
    };
}

export function CartItemRow({ item }: CartItemRowProps) {
    const { updateQuantity, removeFromCart } = useCart();

    return (
        <Card className="flex flex-col sm:flex-row overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-shadow">
            {/* Imagen del Item */}
            <div className="relative w-full sm:w-40 h-40 sm:h-auto bg-secondary/20">
                <Image
                    src={item.image || "/placeholder-product.jpg"}
                    alt={item.name}
                    className="object-cover"
                    fill
                    sizes="(max-width: 640px) 100vw, 160px"
                />
            </div>

            {/* Detalles */}
            <div className="grow p-4 sm:p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h3 className="text-xl font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Disponible: {item.availableQuantity}
                        </p>
                    </div>
                    <p className="text-xl font-bold text-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                    </p>
                </div>

                <div className="flex justify-between items-end mt-4">
                    {/* Controles de Cantidad */}
                    <div className="flex items-center border rounded-md bg-background">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none text-muted-foreground hover:text-primary"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center text-sm font-medium">
                            {item.quantity}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none text-muted-foreground hover:text-primary"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.availableQuantity}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Botón Eliminar */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
                        onClick={() => removeFromCart(item.productId)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Eliminar</span>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
