"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { deleteAccount } from "@/actions/user-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteAccountButtonProps {
    userId: string;
}

export function DeleteAccountButton({ userId }: DeleteAccountButtonProps) {
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteAccount(userId, password);
            if (result.success) {
                toast.success("Tu cuenta ha sido eliminada.");
                await signOut({ callbackUrl: "/" });
            } else {
                toast.error(result.message || "No se pudo eliminar la cuenta.");
            }
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="destructive"
                    className="w-full sm:w-auto bg-[#A42D2C] hover:bg-[#A42D2C]/90"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar Cuenta
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar tu cuenta permanentemente?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción <strong>no se puede deshacer</strong>. Se borrarán todos
                        tus datos: pedidos, reseñas y carrito. Ingresa tu contraseña para
                        confirmar.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-2 py-2">
                    <Label htmlFor="delete-password">Contraseña actual</Label>
                    <Input
                        id="delete-password"
                        type="password"
                        placeholder="Confirma tu contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending || !password}
                        className="bg-[#A42D2C] hover:bg-[#A42D2C]/90"
                    >
                        {isPending ? "Eliminando..." : "Sí, eliminar mi cuenta"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
