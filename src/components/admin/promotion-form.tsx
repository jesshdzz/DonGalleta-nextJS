'use client';

import { promotionSchema, PromotionFormValues } from "@/lib/validators/promotion-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Switch } from "../ui/switch";
import { upsertPromotion } from "@/actions/pomotion-actions";

const PROMOTION_TYPES = [
    {
        value: "PERCENTAGE",
        label: "Porcentaje",
        description: "Descuento en % sobre el total (ej. 10%)",
    },
    {
        value: "FIXED",
        label: "Monto fijo",
        description: "Descuento de cantidad fija (ej. $50 de descuento)",
    },
    {
        value: "BUY_X_GET_Y",
        label: "Compra X lleva Y",
        description: "Por cada X productos, lleva Y gratis",
    },
] as const;

interface PromotionFormProps {
    defaultValues?: Partial<PromotionFormValues> & { id?: number };
    availableProducts?: { id: number; name: string }[];
}

// Formatea una fecha a "YYYY-MM-DD" para los inputs type="date"
function toDateInputValue(date: Date | undefined): string {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
}

export const PromotionForm = ({ defaultValues, availableProducts = [] }: PromotionFormProps) => {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const form = useForm<z.input<typeof promotionSchema>, unknown, PromotionFormValues>({
        resolver: zodResolver(promotionSchema),
        defaultValues: {
            name: defaultValues?.name ?? "",
            type: defaultValues?.type ?? "PERCENTAGE",
            value: defaultValues?.value ?? 0,
            minAmount: defaultValues?.minAmount ?? 0,
            maxDiscount: defaultValues?.maxDiscount ?? 0,
            startDate: defaultValues?.startDate ?? new Date(),
            expirationDate: defaultValues?.expirationDate ?? new Date(),
            isActive: defaultValues?.isActive ?? true,
            products: defaultValues?.products ?? [],
        },
    });

    async function onSubmit(data: PromotionFormValues) {
        setIsPending(true);

        const formData = new FormData();
        if (defaultValues?.id) formData.append("id", defaultValues.id.toString());
        formData.append("name", data.name);
        formData.append("type", data.type);
        formData.append("value", data.value.toString());
        formData.append("minAmount", data.minAmount.toString());
        formData.append("maxDiscount", data.maxDiscount.toString());
        formData.append("startDate", data.startDate.toISOString());
        formData.append("expirationDate", data.expirationDate.toISOString());
        formData.append("isActive", data.isActive ? "true" : "false");
        formData.append("products", JSON.stringify(data.products ?? []));

        const result = await upsertPromotion(defaultValues?.id, formData);

        if (!result.success) {
            toast.error(result.message ?? "Error al guardar la promoción.");
            if (result.errors) {
                Object.keys(result.errors).forEach((key) => {
                    const k = key as keyof PromotionFormValues;
                    if (result.errors![k]) {
                        form.setError(k, { type: "custom", message: result.errors![k]![0] });
                    }
                });
            }
        } else {
            toast.success(result.message ?? "Promoción guardada.");
            router.push("/admin/promociones");
            router.refresh();
        }

        setIsPending(false);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">

                {/* Nombre */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre de la promoción</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Descuento de verano" {...field} />
                            </FormControl>
                            <FormMessage style={{ marginTop: "0" }} />
                        </FormItem>
                    )}
                />

                {/* Tipo de promoción */}
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Tipo de promoción</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col gap-3"
                                >
                                    {PROMOTION_TYPES.map((type) => (
                                        <FormItem
                                            key={type.value}
                                            className="flex items-center gap-3 rounded-md border p-4 cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                                        >
                                            <FormControl>
                                                <RadioGroupItem value={type.value} />
                                            </FormControl>
                                            <div className="space-y-0.5 leading-none">
                                                <FormLabel className="font-medium cursor-pointer">
                                                    {type.label}
                                                </FormLabel>
                                                <FormDescription style={{ marginTop: 0 }}>
                                                    {type.description}
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage style={{ marginTop: "0" }} />
                        </FormItem>
                    )}
                />

                {/* Valor, Monto mínimo, Descuento máximo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} value={field.value as number} />
                                </FormControl>
                                <FormDescription style={{ marginTop: "0" }}>
                                    % o $ según el tipo
                                </FormDescription>
                                <FormMessage style={{ marginTop: "0" }} />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="minAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monto mínimo ($)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} value={field.value as number} />
                                </FormControl>
                                <FormDescription style={{ marginTop: "0" }}>
                                    Compra mínima para aplicar
                                </FormDescription>
                                <FormMessage style={{ marginTop: "0" }} />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="maxDiscount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descuento máximo ($)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} value={field.value as number} />
                                </FormControl>
                                <FormDescription style={{ marginTop: "0" }}>
                                    Tope del descuento
                                </FormDescription>
                                <FormMessage style={{ marginTop: "0" }} />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha de inicio</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        value={toDateInputValue(field.value as Date | undefined)}
                                        onChange={(e) => field.onChange(new Date(e.target.value + "T00:00:00"))}
                                    />
                                </FormControl>
                                <FormMessage style={{ marginTop: "0" }} />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="expirationDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha de vencimiento</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        value={toDateInputValue(field.value as Date | undefined)}
                                        onChange={(e) => field.onChange(new Date(e.target.value + "T23:59:59"))}
                                    />
                                </FormControl>
                                <FormMessage style={{ marginTop: "0" }} />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Productos asociados */}
                {availableProducts.length > 0 && (
                    <div className="space-y-3">
                        <FormLabel>Productos aplicables</FormLabel>
                        <FormDescription>
                            Deja en blanco para que aplique a todos los productos.
                        </FormDescription>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border rounded-md p-4 max-h-52 overflow-y-auto">
                            {availableProducts.map((product) => (
                                <FormField
                                    key={product.id}
                                    control={form.control}
                                    name="products"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(product.id)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value ?? []), product.id])
                                                            : field.onChange(
                                                                  (field.value ?? []).filter((v) => v !== product.id)
                                                              );
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer leading-none">
                                                {product.name}
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                        <FormMessage />
                    </div>
                )}

                {/* Activa */}
                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Promoción activa</FormLabel>
                                <FormDescription style={{ marginTop: 0 }}>
                                    Si está desactivada, no se aplicará en la tienda.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                    {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Guardar promoción
                </Button>
            </form>
        </Form>
    );
};
