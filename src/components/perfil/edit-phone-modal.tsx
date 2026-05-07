// src/components/perfil/edit-phone-modal.tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updatePhoneNumber } from "@/actions/user-actions";

interface EditPhoneModalProps {
    userId: string;
    currentPhone: string | null;
}

export function EditPhoneModal({ userId, currentPhone }: EditPhoneModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(currentPhone || "");
    const [isPending, startTransition] = useTransition();

    const handleOpenChange = (open: boolean) => {
        if (!open) setPhoneNumber(currentPhone || "");
        setIsOpen(open);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validación extra en el cliente
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(phoneNumber)) {
            toast.error("Formato inválido", {
                description: "Ingresa solo números (ej. 9531234567). Debe tener entre 10 y 15 dígitos."
            });
            return;
        }

        startTransition(async () => {
            const result = await updatePhoneNumber(userId, phoneNumber);

            if (result.success) {
                toast.success("Teléfono guardado", {
                    description: "Tu número telefónico se ha actualizado correctamente.",
                });
                setIsOpen(false);
            } else {
                toast.error("Error", {
                    description: result.error || "No se pudo actualizar el teléfono.",
                });
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full sm:w-auto border-[#58321D] text-[#58321D] hover:bg-[#F7DCBE]/30"
                >
                    <Phone className="h-4 w-4" />
                    {currentPhone ? "Actualizar Teléfono" : "Añadir Teléfono"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle className="text-[#58321D]">Número Telefónico</DialogTitle>
                    <DialogDescription>
                        {currentPhone
                            ? "Actualiza tu número telefónico para que podamos contactarte sobre tus pedidos."
                            : "Añade un número telefónico para recibir actualizaciones de tus compras."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="phone" className="text-[#58321D] font-bold">
                            Teléfono <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="Ej. 9531234567"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="pl-9"
                                required
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Ingresa entre 10 y 15 dígitos, sin espacios ni guiones.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending || !phoneNumber}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                "Guardar Teléfono"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}