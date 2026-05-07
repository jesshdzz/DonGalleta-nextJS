"use client";

import { useState, useTransition } from "react";
import { updatePassword } from "@/actions/user-actions";
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
import { Eye, EyeOff, Key } from "lucide-react";
import { toast } from "sonner";

interface EditPasswordModalProps {
    userId: string;
}

export function EditPasswordModal({ userId }: EditPasswordModalProps) {
    const [open, setOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Las contraseñas nuevas no coinciden.");
            return;
        }
        startTransition(async () => {
            const result = await updatePassword(userId, currentPassword, newPassword);
            if (result.success) {
                toast.success("Contraseña actualizada correctamente.");
                setOpen(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error(result.message || "Error al actualizar la contraseña.");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full sm:w-auto border-[#58321D] text-[#58321D] hover:bg-[#F7DCBE]/30"
                >
                    <Key className="mr-2 h-4 w-4" />
                    Cambiar Contraseña
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cambiar Contraseña</DialogTitle>
                    <DialogDescription>
                        Ingresa tu contraseña actual y elige una nueva.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="current-password">Contraseña actual <span className="text-destructive">*</span></Label>
                        <div className="relative">
                            <Input
                                id="current-password"
                                type={showCurrent ? "text" : "password"}
                                placeholder="Tu contraseña actual"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="pr-10"
                            />
                            <button type="button" tabIndex={-1} onClick={() => setShowCurrent((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label={showCurrent ? "Ocultar" : "Mostrar"}>
                                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="new-password">Nueva contraseña <span className="text-destructive">*</span></Label>
                        <div className="relative">
                            <Input
                                id="new-password"
                                type={showNew ? "text" : "password"}
                                placeholder="Mínimo 6 caracteres"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="pr-10"
                            />
                            <button type="button" tabIndex={-1} onClick={() => setShowNew((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label={showNew ? "Ocultar" : "Mostrar"}>
                                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Confirmar nueva contraseña <span className="text-destructive">*</span></Label>
                        <div className="relative">
                            <Input
                                id="confirm-password"
                                type={showConfirm ? "text" : "password"}
                                placeholder="Repite la nueva contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="pr-10"
                            />
                            <button type="button" tabIndex={-1} onClick={() => setShowConfirm((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label={showConfirm ? "Ocultar" : "Mostrar"}>
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <DialogFooter className="pt-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-[#58321D] hover:bg-[#58321D]/90"
                        >
                            {isPending ? "Guardando..." : "Actualizar contraseña"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
