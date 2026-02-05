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

// Recibimos un producto opcional por si estamos editando
interface ProductFormProps {
    defaultValues?: Partial<ProductFormValues> & { id?: number };
}

export const ProductForm = ({ defaultValues }: ProductFormProps) => {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    // 1. Configuración del formulario
    // Usamos z.input<typeof productSchema> para que useForm acepte los valores "raw" (strings) antes de la coerción
    // y ProductFormValues para los valores transformados (números) que recibe handleSubmit
    const form = useForm<z.input<typeof productSchema>, any, ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: defaultValues?.name || "",
            slug: defaultValues?.slug || "",
            description: defaultValues?.description || "",
            price: defaultValues?.price || 0,
            stock: defaultValues?.stock || 0,
            image: defaultValues?.image || "",
            isActive: defaultValues?.isActive ?? true,
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
            router.push("/admin/products");
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
                                <FormLabel>Nombre del Producto</FormLabel>
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
                                <FormLabel>Slug (URL)</FormLabel>
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
                                <FormLabel>Precio ($)</FormLabel>
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
                                <FormLabel>Stock Disponible</FormLabel>
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

                {/* Imagen (URL por ahora) */}
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL de Imagen</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormDescription style={{ marginTop: "0" }}>Pega una URL de imagen externa para probar.</FormDescription>
                            <FormMessage style={{ marginTop: "0" }} />
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