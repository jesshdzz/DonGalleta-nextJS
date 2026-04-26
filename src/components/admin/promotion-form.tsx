'use client';

import { promotionSchema, PromotionFormValues } from "@/lib/validators/promotion-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Info } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Switch } from "../ui/switch";
import { upsertPromotion } from "@/actions/promotion-actions";

// ── Tipos ──────────────────────────────────────────────────────────────────────
const PROMOTION_TYPES = [
    {
        value: "PERCENTAGE" as const,
        label: "Porcentaje (%)",
        description: "Descuento en % sobre el total del pedido. Ej: 10% de descuento.",
    },
    {
        value: "FIXED" as const,
        label: "Monto Fijo ($)",
        description: "Descuento de cantidad fija en pesos. Ej: $50 de descuento.",
    },
    {
        value: "BUY_X_GET_Y" as const,
        label: "Compra X, Lleva Y gratis",
        description: "Por cada X productos comprados, el cliente lleva Y adicionales gratis.",
    },
] as const;

// ── Props ──────────────────────────────────────────────────────────────────────
interface PromotionFormProps {
    defaultValues?: Partial<PromotionFormValues> & { id?: number };
    availableProducts?: { id: number; name: string }[];
}

// ── Utilidades ─────────────────────────────────────────────────────────────────
function toDateInputValue(date: Date | string | undefined | null): string {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
}

// ── Componente ─────────────────────────────────────────────────────────────────
export const PromotionForm = ({ defaultValues, availableProducts = [] }: PromotionFormProps) => {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const form = useForm<z.input<typeof promotionSchema>, unknown, PromotionFormValues>({
        resolver: zodResolver(promotionSchema),
        defaultValues: {
            name: defaultValues?.name ?? "",
            type: defaultValues?.type ?? "PERCENTAGE",
            value: (defaultValues as { value?: number })?.value ?? 0,
            minOrderAmount: (defaultValues as { minOrderAmount?: number | null })?.minOrderAmount ?? null,
            maxDiscountCap: (defaultValues as { maxDiscountCap?: number | null })?.maxDiscountCap ?? null,
            buyQuantity: (defaultValues as { buyQuantity?: number | null })?.buyQuantity ?? null,
            getQuantity: (defaultValues as { getQuantity?: number | null })?.getQuantity ?? null,
            startDate: defaultValues?.startDate ?? new Date(),
            expirationDate: defaultValues?.expirationDate ?? new Date(),
            isActive: defaultValues?.isActive ?? true,
            products: defaultValues?.products ?? [],
        } as z.input<typeof promotionSchema>,
    });

    // Observamos el tipo activo para renderizar condicionalmente
    const activeType = useWatch({ control: form.control, name: "type" });

    async function onSubmit(data: PromotionFormValues) {
        setIsPending(true);

        const fd = new FormData();
        if (defaultValues?.id) fd.append("id", defaultValues.id.toString());

        fd.append("name", data.name);
        fd.append("type", data.type);
        fd.append("startDate", data.startDate.toISOString());
        fd.append("expirationDate", data.expirationDate.toISOString());
        fd.append("isActive", data.isActive ? "true" : "false");
        fd.append("products", JSON.stringify(data.products ?? []));

        if (data.type === "PERCENTAGE") {
            fd.append("value", String(data.value ?? 0));
            fd.append("minOrderAmount", String(data.minOrderAmount ?? ""));
            fd.append("maxDiscountCap", String(data.maxDiscountCap ?? ""));
        } else if (data.type === "FIXED") {
            fd.append("value", String(data.value ?? 0));
            fd.append("minOrderAmount", String(data.minOrderAmount ?? ""));
        } else if (data.type === "BUY_X_GET_Y") {
            fd.append("buyQuantity", String(data.buyQuantity));
            fd.append("getQuantity", String(data.getQuantity));
        }

        const result = await upsertPromotion(defaultValues?.id, fd);

        if (!result.success) {
            toast.error(result.message ?? "Error al guardar la promoción.");
            if ("errors" in result && result.errors) {
                Object.entries(result.errors).forEach(([key, messages]) => {
                    form.setError(key as keyof PromotionFormValues, {
                        type: "custom",
                        message: (messages as string[])[0],
                    });
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

                {/* ── Nombre ── */}
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

                {/* ── Tipo ── */}
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Tipo de promoción</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={(v) => {
                                        field.onChange(v);
                                        // Reset campos específicos al cambiar de tipo
                                        form.setValue("value", 0);
                                        form.setValue("minOrderAmount" as keyof PromotionFormValues, null as never);
                                        form.setValue("maxDiscountCap" as keyof PromotionFormValues, null as never);
                                        form.setValue("buyQuantity" as keyof PromotionFormValues, null as never);
                                        form.setValue("getQuantity" as keyof PromotionFormValues, null as never);
                                        form.clearErrors();
                                    }}
                                    defaultValue={field.value}
                                    className="flex flex-col gap-3"
                                >
                                    {PROMOTION_TYPES.map((type) => (
                                        <FormItem
                                            key={type.value}
                                            className="flex items-center gap-3 rounded-md border p-4 cursor-pointer has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
                                        >
                                            <FormControl>
                                                <RadioGroupItem value={type.value} />
                                            </FormControl>
                                            <div className="space-y-0.5 leading-none">
                                                <FormLabel className="font-medium cursor-pointer">{type.label}</FormLabel>
                                                <FormDescription style={{ marginTop: 0 }}>{type.description}</FormDescription>
                                            </div>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage style={{ marginTop: "0" }} />
                        </FormItem>
                    )}
                />

                {/* ── Campos condicionales por tipo ── */}

                {/* PERCENTAGE */}
                {activeType === "PERCENTAGE" && (
                    <div className="rounded-lg border border-dashed p-5 space-y-5">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Info className="h-4 w-4" />
                            <span>Configura el porcentaje de descuento y sus límites opcionales.</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Porcentaje (%)*</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0.01" max="100" placeholder="10" {...field} value={field.value as number ?? ""} />
                                        </FormControl>
                                        <FormDescription style={{ marginTop: "0" }}>Entre 0.01 y 100</FormDescription>
                                        <FormMessage style={{ marginTop: "0" }} />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={"minOrderAmount" as keyof PromotionFormValues}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Compra mínima ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0" placeholder="0.00 (opcional)" {...field} value={(field.value as number | null) ?? ""} onChange={e => field.onChange(e.target.value === "" ? null : e.target.value)} />
                                        </FormControl>
                                        <FormDescription style={{ marginTop: "0" }}>Dejar vacío = sin mínimo</FormDescription>
                                        <FormMessage style={{ marginTop: "0" }} />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={"maxDiscountCap" as keyof PromotionFormValues}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tope máximo ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0" placeholder="0.00 (opcional)" {...field} value={(field.value as number | null) ?? ""} onChange={e => field.onChange(e.target.value === "" ? null : e.target.value)} />
                                        </FormControl>
                                        <FormDescription style={{ marginTop: "0" }}>Dejar vacío = sin tope</FormDescription>
                                        <FormMessage style={{ marginTop: "0" }} />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                )}

                {/* FIXED */}
                {activeType === "FIXED" && (
                    <div className="rounded-lg border border-dashed p-5 space-y-5">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Info className="h-4 w-4" />
                            <span>Configura el descuento en pesos y la compra mínima opcional.</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descuento ($)*</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0.01" placeholder="50.00" {...field} value={field.value as number ?? ""} />
                                        </FormControl>
                                        <FormDescription style={{ marginTop: "0" }}>Monto fijo de descuento</FormDescription>
                                        <FormMessage style={{ marginTop: "0" }} />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={"minOrderAmount" as keyof PromotionFormValues}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Compra mínima ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0" placeholder="0.00 (opcional)" {...field} value={(field.value as number | null) ?? ""} onChange={e => field.onChange(e.target.value === "" ? null : e.target.value)} />
                                        </FormControl>
                                        <FormDescription style={{ marginTop: "0" }}>Dejar vacío = sin mínimo</FormDescription>
                                        <FormMessage style={{ marginTop: "0" }} />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                )}

                {/* BUY_X_GET_Y */}
                {activeType === "BUY_X_GET_Y" && (
                    <div className="rounded-lg border border-dashed p-5 space-y-5">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Info className="h-4 w-4" />
                            <span>Ejemplo &quot;Lleva 12, Paga 10&quot;: El tamaño del grupo (X) es 12, y de esos, (Y) 2 son gratis.</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                            <FormField
                                control={form.control}
                                name={"buyQuantity" as keyof PromotionFormValues}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cantidad a llevar (X)*</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="1" min="1" placeholder="Ej. 12" {...field} value={(field.value as number | null) ?? ""} />
                                        </FormControl>
                                        <FormDescription style={{ marginTop: "0" }}>El total de unidades en el carrito</FormDescription>
                                        <FormMessage style={{ marginTop: "0" }} />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={"getQuantity" as keyof PromotionFormValues}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cantidad gratis (Y)*</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="1" min="1" placeholder="Ej. 2" {...field} value={(field.value as number | null) ?? ""} />
                                        </FormControl>
                                        <FormDescription style={{ marginTop: "0" }}>Unidades descontadas del total (X)</FormDescription>
                                        <FormMessage style={{ marginTop: "0" }} />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <p className="text-xs text-primary font-medium">
                            ⚠️ Para este tipo de promoción debes seleccionar al menos un producto en la sección de abajo.
                        </p>
                    </div>
                )}

                {/* ── Fechas ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha de inicio*</FormLabel>
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
                                <FormLabel>Fecha de vencimiento*</FormLabel>
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

                {/* ── Productos aplicables ── */}
                <div className="space-y-3">
                    <div>
                        <FormLabel>Productos aplicables</FormLabel>
                        <FormDescription>
                            {activeType === "BUY_X_GET_Y"
                                ? "Requerido: selecciona los productos que participan en la promoción."
                                : "Opcional: deja sin seleccionar para que aplique a todos los productos."}
                        </FormDescription>
                    </div>
                    {availableProducts.length > 0 ? (
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
                                                    checked={(field.value as number[] | undefined)?.includes(product.id)}
                                                    onCheckedChange={(checked) => {
                                                        const current = (field.value as number[] | undefined) ?? [];
                                                        return checked
                                                            ? field.onChange([...current, product.id])
                                                            : field.onChange(current.filter((v) => v !== product.id));
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
                    ) : (
                        <p className="text-sm text-muted-foreground border rounded-md p-4">
                            No hay productos activos registrados.
                        </p>
                    )}
                    <FormField
                        control={form.control}
                        name="products"
                        render={() => <FormMessage />}
                    />
                </div>

                {/* ── Activa ── */}
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
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
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
