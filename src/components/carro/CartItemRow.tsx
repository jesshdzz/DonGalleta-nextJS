"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2, AlertCircle } from "lucide-react";
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
    applicablePromotions?: {
        id: number;
        name: string;
        type: "PERCENTAGE" | "FIXED" | "BUY_X_GET_Y";
        value: number;
        minOrderAmount: number | null;
        buyQuantity: number | null;
        getQuantity: number | null;
    }[];
    cartTotal?: number;
}

export function CartItemRow({ item, applicablePromotions, cartTotal }: CartItemRowProps) {
    const { updateQuantity, removeFromCart } = useCart();

    const isOutOfStock = item.availableQuantity === 0;
    const hasInsufficientStock = item.quantity > item.availableQuantity;

    // Si no hay stock o si pides más de lo que hay, la carta se pone en estado "Inválido"
    const isInvalid = isOutOfStock || hasInsufficientStock;

    return (
        <Card className={`flex flex-col overflow-hidden border-border/60 shadow-sm transition-all ${isInvalid ? 'opacity-60 bg-secondary/10 border-destructive/30' : ''}`}>
            <div className="flex flex-col sm:flex-row">
                {/* Imagen del Item */}
                <div className="relative w-full sm:w-40 h-40 sm:h-auto bg-secondary/20">
                    <Image
                        src={item.image || "/placeholder-product.jpg"}
                        alt={item.name}
                        className={`object-cover ${isInvalid ? 'grayscale' : ''}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 160px"
                    />
                </div>

                {/* Detalles */}
                <div className="grow p-4 sm:p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h3 className={`text-xl font-semibold ${isOutOfStock ? 'text-muted-foreground line-through' : (hasInsufficientStock ? 'text-destructive' : 'text-foreground')}`}>
                                {item.name}
                            </h3>
                            {isOutOfStock ? (
                                <p className="text-destructive text-sm font-bold flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-4 h-4" /> ¡Se agotaron! Alguien te ganó.
                                </p>
                            ) : hasInsufficientStock ? (
                                <p className="text-destructive text-sm font-bold flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-4 h-4" /> Stock insuficiente. Reduce a {item.availableQuantity}.
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground mt-1">
                                    Unidades disponibles: {item.availableQuantity}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col items-end">
                            <p className={`text-xl font-bold ${isInvalid ? 'text-muted-foreground line-through' : 'text-primary'}`}>
                                ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className={`text-sm mt-1 ${isInvalid ? 'text-muted-foreground line-through' : 'text-primary'}`}>
                                precio unitario: ${(item.price).toFixed(2)}
                            </p>
                        </div>

                    </div>

                    <div className="flex justify-between items-end mt-4">
                        {/* Controles de Cantidad */}
                        <div className={`flex items-center border rounded-md bg-background ${isOutOfStock ? 'opacity-30 pointer-events-none' : ''}`}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`h-9 w-9 rounded-none text-muted-foreground hover:text-primary ${hasInsufficientStock ? 'text-destructive animate-pulse' : ''}`}
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-10 text-center text-sm font-medium">
                                {isOutOfStock ? 0 : item.quantity}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-none text-muted-foreground hover:text-primary"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                // Bloqueamos el "Más" si ya llegaste al límite del stock disponible
                                disabled={item.quantity >= item.availableQuantity}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Botón Eliminar */}
                        <Button
                            variant={isInvalid ? "destructive" : "ghost"}
                            size="sm"
                            className={isInvalid ? "gap-2" : "text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"}
                            onClick={() => removeFromCart(item.productId)}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">{isOutOfStock ? "Quitar agotado" : "Eliminar"}</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Promociones aplicables al producto */}
            {!isInvalid && applicablePromotions && applicablePromotions.length > 0 && (
                <div className="bg-amber-50/50 border-t border-amber-100 p-3 sm:px-6">
                    <div className="space-y-2">
                        {applicablePromotions.map(promo => {
                            let msg = "";
                            let Icon = AlertCircle;
                            if (promo.type === "PERCENTAGE") {
                                const min = promo.minOrderAmount ?? 0;
                                if (min > 0 && (item.price * item.quantity) < min) {
                                    const missing = (min - (item.price * item.quantity)).toFixed(2);
                                    msg = `Agrega $${missing} más en tu pedido y obtén ${promo.value}% de descuento con "${promo.name}".`;
                                } else {
                                    msg = `¡Aprovecha ${promo.value}% de descuento disponible con "${promo.name}"!`;
                                }
                            } else if (promo.type === "FIXED") {
                                const min = promo.minOrderAmount ?? 0;
                                if (min > 0 && (item.price * item.quantity) < min) {
                                    const missing = (min - (item.price * item.quantity)).toFixed(2);
                                    msg = `Agrega $${missing} más en tu pedido y obtén $${promo.value.toFixed(2)} de descuento con "${promo.name}".`;
                                } else {
                                    msg = `¡Aprovecha $${promo.value.toFixed(2)} de descuento disponible con "${promo.name}"!`;
                                }
                            } else if (promo.type === "BUY_X_GET_Y" && promo.buyQuantity && promo.getQuantity) {
                                const currentQuantity = item.quantity;
                                const groupSize = promo.buyQuantity;
                                const remainder = currentQuantity % groupSize;
                                
                                if (remainder > 0) {
                                    const needed = groupSize - remainder;
                                    const groups = Math.floor(currentQuantity / groupSize);
                                    
                                    if (groups === 0) {
                                        msg = `Lleva ${needed} galleta(s) más y recibe ${promo.getQuantity} de regalo con "${promo.name}".`;
                                    } else {
                                        msg = `Lleva ${needed} galleta(s) más para tu siguiente grupo de ${promo.getQuantity} de regalo con "${promo.name}".`;
                                    }
                                } else {
                                    const groups = currentQuantity / groupSize;
                                    msg = `¡Aprovechando la promo "${promo.name}"! Tienes ${groups * promo.getQuantity} de regalo.`;
                                }
                            }

                            return msg ? (
                                <p key={promo.id} className="text-sm text-amber-800 font-medium flex items-center gap-2">
                                    <span className="bg-amber-100 text-amber-700 p-1 rounded-full"><AlertCircle className="w-3.5 h-3.5" /></span>
                                    {msg}
                                </p>
                            ) : null;
                        })}
                    </div>
                </div>
            )}
        </Card>
    );
}