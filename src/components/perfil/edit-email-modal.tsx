"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { updateEmail } from "@/actions/user-actions";
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
import { Eye, EyeOff, Mail } from "lucide-react";
import { toast } from "sonner";

interface EditEmailModalProps {
    userId: string;
    currentEmail: string;
}

export function EditEmailModal({ userId, currentEmail }: EditEmailModalProps) {
    const [open, setOpen] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await updateEmail(userId, newEmail, password);
            if (result.success) {
                toast.success("Correo actualizado. Vuelve a iniciar sesión.");
                setOpen(false);
                await signOut({ callbackUrl: "/auth/login" });
            } else {
                toast.error(result.message || "Error al actualizar el correo.");
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
                    <Mail className="mr-2 h-4 w-4" />
                    Cambiar Correo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cambiar Correo Electrónico</DialogTitle>
                    <DialogDescription>
                        Actual: <span className="font-medium">{currentEmail}</span>. Deberás
                        volver a iniciar sesión.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="new-email">Nuevo correo</Label>
                        <Input
                            id="new-email"
                            type="email"
                            placeholder="nuevo@correo.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email-password">Contraseña actual</Label>
                        <div className="relative">
                            <Input
                                id="email-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Tu contraseña actual"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pr-10"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                            {isPending ? "Guardando..." : "Actualizar correo"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
