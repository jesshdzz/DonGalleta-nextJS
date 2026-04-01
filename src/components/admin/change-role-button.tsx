'use client';

import { changeRole } from "@/actions/user-actions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Role } from "@prisma/client";
import { ArrowRightLeft, Trash2, UserRoundPen } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface ChangeRoleButtonProps {
    userId: string;
    newRole: Role;
}

export function ChangeRoleButton({ userId, newRole }: ChangeRoleButtonProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            const result = await changeRole(userId, newRole);

            if (result.success) {
                toast.success("Rol cambiado correctamente");
            } else {
                toast.error(result.message || "Error al cambiar el rol");
            }
            setOpen(false);
        });
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleClick}
                >
                    <ArrowRightLeft className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro de que quieres cambiar el rol del usuario?</AlertDialogTitle>
                    <AlertDialogDescription>
                        El usuario cambiará su rol a <span className="font-bold">{newRole}</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault(); // Evitamos que cierre automático para manejarlo nosotros
                            handleDelete();
                        }}
                        disabled={isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isPending ? "Cambiando..." : "Cambiar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );

}