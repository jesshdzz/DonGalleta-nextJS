import { z } from 'zod';

export const promotionSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    type: z.enum(["BUY_X_GET_Y", "PERCENTAGE", "FIXED"]),
    value: z.coerce.number().min(0.01, "El valor debe ser mayor a 0"),
    minAmount: z.coerce.number().min(1, "La cantidad miníma debe ser al menos 1"),
    maxDiscount: z.coerce.number().min(1, "El descuento maximo debe ser mayor a 0"),
    startDate: z.coerce.date(),
    expirationDate: z.coerce.date(),
    isActive: z.boolean().default(true),
    products: z.array(z.number()).optional(),

})

export type PromotionFormValues = z.infer<typeof promotionSchema>;
