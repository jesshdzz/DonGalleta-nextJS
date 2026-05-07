'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { storeSchema, StoreFormValues } from "@/lib/validators/store-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { upsertStore } from "@/actions/store-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";

interface StoreFormProps {
    defaultValues?: Partial<StoreFormValues> & { id?: string };
}

export const StoreForm = ({ defaultValues }: StoreFormProps) => {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const form = useForm<z.input<typeof storeSchema>, unknown, StoreFormValues>({
        resolver: zodResolver(storeSchema),
        defaultValues: {
            name: defaultValues?.name || "",
            address: defaultValues?.address || "",
            schedule: defaultValues?.schedule || "",
            latitude: defaultValues?.latitude || 0,
            longitude: defaultValues?.longitude || 0,
            phone: defaultValues?.phone || "",
            isActive: defaultValues?.isActive ?? true,
        },
    });

    async function onSubmit(data: StoreFormValues) {
        setIsPending(true);

        const formData = new FormData();
        if (defaultValues?.id) formData.append("id", defaultValues.id);
        formData.append("name", data.name);
        formData.append("address", data.address);
        formData.append("schedule", data.schedule || "");
        formData.append("latitude", data.latitude.toString());
        formData.append("longitude", data.longitude.toString());
        formData.append("phone", data.phone || "");
        if (data.isActive) formData.append("isActive", "on");

        const result = await upsertStore(null, formData);

        if (!result.success) {
            alert(result.message);

            if (result.errors) {
                Object.keys(result.errors).forEach((key) => {
                    const errorKey = key as keyof StoreFormValues;
                    if (result.errors && result.errors[errorKey]) {
                        form.setError(errorKey, {
                            type: "custom",
                            message: result.errors[errorKey]![0],
                        });
                    }
                });
            }
        } else {
            router.push("/admin/tiendas");
            router.refresh();
        }

        setIsPending(false);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Nombre */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre de la Sucursal <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej. Don Galleta Centro" {...field} />
                                </FormControl>
                                <FormMessage style={{ marginTop: "0" }} />
                            </FormItem>
                        )}
                    />

                    {/* Teléfono */}
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej. 614-123-4567" {...field} />
                                </FormControl>
                                <FormMessage style={{ marginTop: "0" }} />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Dirección */}
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dirección <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Av. Independencia #123, Col. Centro" {...field} />
                            </FormControl>
                            <FormMessage style={{ marginTop: "0" }} />
                        </FormItem>
                    )}
                />

                {/* Horario */}
                <FormField
                    control={form.control}
                    name="schedule"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Horario</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Lun-Vie 9:00-18:00, Sáb 10:00-14:00" {...field} />
                            </FormControl>
                            <FormDescription style={{ marginTop: "0" }}>Opcional. Describe el horario de atención.</FormDescription>
                            <FormMessage style={{ marginTop: "0" }} />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Latitud */}
                    <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Latitud</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder="Ej. 28.6353"
                                        {...field}
                                        value={field.value as number}
                                    />
                                </FormControl>
                                <FormMessage style={{ marginTop: "0" }} />
                            </FormItem>
                        )}
                    />

                    {/* Longitud */}
                    <FormField
                        control={form.control}
                        name="longitude"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Longitud</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder="Ej. -106.0889"
                                        {...field}
                                        value={field.value as number}
                                    />
                                </FormControl>
                                <FormMessage style={{ marginTop: "0" }} />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Activo */}
                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Sucursal Activa</FormLabel>
                                <FormDescription style={{ marginTop: "0" }}>
                                    Si se desmarca, la sucursal no aparecerá en el sitio.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Sucursal
                </Button>
            </form>
        </Form>
    );
};
