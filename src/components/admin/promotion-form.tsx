'use client';
import { promotionSchema, PromotionFormValues } from "@/lib/validators/promotion-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface PromotionFormProps {
    defaultValues?: Partial<PromotionFormValues> & { id?: number };
}

export const PromotionForm = ({ defaultValues }: PromotionFormProps) => {
    const [isPending, setIsPending] = useState(false);

    const form = useForm<z.input<typeof promotionSchema>, unknown, PromotionFormValues>({
        resolver: zodResolver(promotionSchema),
        defaultValues: {
            name: defaultValues?.name || "",
            type: defaultValues?.type || "BUY_X_GET_Y",
            value: defaultValues?.value || 0,
            minAmount: defaultValues?.minAmount || 0,
            maxDiscount: defaultValues?.maxDiscount || 0,
            startDate: defaultValues?.startDate || new Date(),
            expirationDate: defaultValues?.expirationDate || new Date(),
            isActive: defaultValues?.isActive || true,
            products: defaultValues?.products || [],
        }
    });

    async function onSubmit(data: PromotionFormValues) {
        setIsPending(true);
        console.log(data);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nombre" {...field} />
                                </FormControl>
                                <FormMessage style={{ marginTop: '0' }} />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                    {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                </Button>

            </form>
        </Form>
    )
}
