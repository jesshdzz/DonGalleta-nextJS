'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { productSchema, ProductFormValues } from "@/lib/validators/product-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { upsertProduct } from "@/actions/product-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { ImageUpload } from "./image-upload";

// Recibimos un producto opcional por si estamos editando
interface ProductFormProps {
    defaultValues?: Partial<ProductFormValues> & { id?: number };
    availableFlavors?: { id: number; name: string }[];
}

export const ProductForm = ({ defaultValues, availableFlavors = [] }: ProductFormProps) => {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    // 1. Configuración del formulario
    // Usamos z.input<typeof productSchema> para que useForm acepte los valores "raw" (strings) antes de la coerción
    // y ProductFormValues para los valores transformados (números) que recibe handleSubmit
    const form = useForm<z.input<typeof productSchema>, unknown, ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: defaultValues?.name || "",
            slug: defaultValues?.slug || "",
            description: defaultValues?.description || "",
            price: defaultValues?.price || 0,
            stock: defaultValues?.stock || 0,
            image: defaultValues?.image || "",
            isActive: defaultValues?.isActive ?? true,
            flavors: defaultValues?.flavors || [], // Array de IDs
        },
    });

    // 2. Manejo del envío
    async function onSubmit(data: ProductFormValues) {
        setIsPending(true);

        // Creamos un FormData manualmente porque nuestra Server Action espera FormData
        // (Esto es necesario si en el futuro subimos archivos reales)
        const formData = new FormData();
        if (defaultValues?.id) formData.append("id", defaultValues.id.toString());
        formData.append("name", data.name);
        formData.append("slug", data.slug);
        formData.append("description", data.description || "");
        formData.append("price", data.price.toString());
        formData.append("stock", data.stock.toString());
        formData.append("image", data.image || "");
        if (data.isActive) formData.append("isActive", "on");
        // Convertimos el array de IDs a JSON string para enviarlo
        formData.append("flavors", JSON.stringify(data.flavors));

        const result = await upsertProduct(null, formData);

        if (!result.success) {
            alert(result.message);

            if (result.errors) {
                // Casteamos 'key' porque Object.keys devuelve string[] y TS es estricto
                Object.keys(result.errors).forEach((key) => {
                    const errorKey = key as keyof ProductFormValues;
                    if (result.errors && result.errors[errorKey]) {
                        form.setError(errorKey, {
                            type: "custom",
                            message: result.errors[errorKey]![0],
                        });
                    }
                });
            }
        } else {
            router.push("/admin/productos");
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
                                <FormLabel>Nombre del Producto <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej. Galleta ChocoChips" {...field} />
                                </FormControl>
                                <FormMessage style={{ marginTop: "0" }} />
                            </FormItem>
                        )}
                    />

                    {/* Slug (URL amigable) */}
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Slug (URL) <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="galleta-chocochips" {...field} />
                                </FormControl>
                                <FormDescription style={{ marginTop: "0" }}>Identificador único para la URL.</FormDescription>
                                <FormMessage style={{ marginTop: "0" }} />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Precio */}
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Precio ($) <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...field}
                                        value={field.value as number}
                                    />
                                </FormControl>
                                <FormMessage style={{ marginTop: "0" }} />
                            </FormItem>
                        )}
                    />

                    {/* Stock */}
                    <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stock Disponible <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="1"
                                        {...field}
                                        value={field.value as number}
                                    />
                                </FormControl>
                                <FormMessage style={{ marginTop: "0" }} />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Imagen (Uploadthing) */}
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Imagen del Producto</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value ?? ""}
                                    onChange={(url) => field.onChange(url)}
                                    onRemove={() => field.onChange("")}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* Descripción */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Ingredientes, detalles..." {...field} />
                            </FormControl>
                            <FormMessage style={{ marginTop: "0" }} />
                        </FormItem>
                    )}
                />

                {/* Sabores */}
                <div className="space-y-4">
                    <FormLabel>Sabores Disponibles</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border p-4 rounded-md">
                        {availableFlavors.map((flavor) => (
                            <FormField
                                key={flavor.id}
                                control={form.control}
                                name="flavors"
                                render={({ field }) => {
                                    return (
                                        <FormItem
                                            key={flavor.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(flavor.id)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...field.value || [], flavor.id])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                    (value) => value !== flavor.id
                                                                ) || []
                                                            )
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">
                                                {flavor.name}
                                            </FormLabel>
                                        </FormItem>
                                    )
                                }}
                            />
                        ))}
                        {availableFlavors.length === 0 && (
                            <p className="text-sm text-muted-foreground col-span-3">No hay sabores registrados. Ve a &quot;Sabores&quot; para crear uno.</p>
                        )}
                    </div>
                    <FormMessage />
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
                                <FormLabel>Producto Activo</FormLabel>
                                <FormDescription style={{ marginTop: "0" }}>
                                    Si se desmarca, el producto no aparecerá en la tienda.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Producto
                </Button>
            </form>
        </Form>
    );
};