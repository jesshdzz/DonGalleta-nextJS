'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { flavorSchema, FlavorFormValues } from "@/lib/validators/flavor-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { upsertFlavor } from "@/actions/flavor-actions";
import { useState, useTransition } from "react";
import { Loader2, Save, Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface FlavorFormProps {
    flavorToEdit?: { id: number; name: string } | null;
    onClose?: () => void;
}

const FlavorForm = ({ flavorToEdit, onClose }: FlavorFormProps) => {
    const [isPending, startTransition] = useTransition();

    const form = useForm<FlavorFormValues>({
        resolver: zodResolver(flavorSchema),
        defaultValues: {
            name: flavorToEdit?.name || "",
        },
    });

    function onSubmit(data: FlavorFormValues) {
        startTransition(async () => {
            const formData = new FormData();
            if (flavorToEdit) formData.append("id", flavorToEdit.id.toString());
            formData.append("name", data.name);

            const result = await upsertFlavor(null, formData);

            if (result.success) {
                toast.success(result.message);
                form.reset();
                if (onClose) onClose();
            } else {
                toast.error(result.message);
                if (result.errors?.name) {
                    form.setError("name", { message: result.errors.name[0] });
                }
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Sabor</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Chocolate, Vainilla..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    {flavorToEdit ? "Actualizar" : "Guardar"}
                </Button>
            </form>
        </Form>
    );
};

export function FlavorDialog({ flavorToEdit, trigger }: { flavorToEdit?: { id: number; name: string } | null, trigger?: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Nuevo Sabor
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{flavorToEdit ? "Editar Sabor" : "Nuevo Sabor"}</DialogTitle>
                </DialogHeader>
                <FlavorForm
                    flavorToEdit={flavorToEdit}
                    onClose={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
