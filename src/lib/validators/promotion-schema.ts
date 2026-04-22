import { z } from 'zod';

// ── Helpers ────────────────────────────────────────────────────────────────────
const positiveDecimal = (label: string) =>
    z.coerce.number({ error: (value) => value.code === 'invalid_type' ? `${label} debe ser un número` : value.message })
        .positive(`${label} debe ser mayor a 0`);

const optionalPositiveDecimal = () =>
    z.coerce.number().min(0).optional().nullable();

const positiveInt = (label: string) =>
    z.coerce.number({ error: (value) => value.code === 'invalid_type' ? `${label} debe ser un número` : value.message })
        .int(`${label} debe ser un número entero`)
        .positive(`${label} debe ser mayor a 0`);

// ── Schemas por tipo (discriminated union) ─────────────────────────────────────
const baseSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(80),
    startDate: z.coerce.date(),
    expirationDate: z.coerce.date(),
    isActive: z.boolean().default(true),
    products: z.array(z.number().int().positive()).optional().default([]),
});

export const percentageSchema = baseSchema.extend({
    type: z.literal('PERCENTAGE'),
    value: positiveDecimal('El porcentaje').max(100, 'El porcentaje no puede exceder 100%'),
    minOrderAmount: optionalPositiveDecimal(),
    maxDiscountCap: optionalPositiveDecimal(),
    // BUY_X_GET_Y fields — not used
    buyQuantity: z.undefined().or(z.null()).optional(),
    getQuantity: z.undefined().or(z.null()).optional(),
});

export const fixedSchema = baseSchema.extend({
    type: z.literal('FIXED'),
    value: positiveDecimal('El monto de descuento'),
    minOrderAmount: optionalPositiveDecimal(),
    // BUY_X_GET_Y fields — not used
    maxDiscountCap: z.undefined().or(z.null()).optional(),
    buyQuantity: z.undefined().or(z.null()).optional(),
    getQuantity: z.undefined().or(z.null()).optional(),
});

export const buyXGetYSchema = baseSchema.extend({
    type: z.literal('BUY_X_GET_Y'),
    buyQuantity: positiveInt('Cantidad de compra (X)'),
    getQuantity: positiveInt('Cantidad gratis (Y)'),
    // These don't apply to BUY_X_GET_Y
    value: z.coerce.number().optional().default(0),
    minOrderAmount: z.undefined().or(z.null()).optional(),
    maxDiscountCap: z.undefined().or(z.null()).optional(),
});

// ── Union final ─────────────────────────────────────────────────────────────────
export const promotionSchema = z.discriminatedUnion('type', [
    percentageSchema,
    fixedSchema,
    buyXGetYSchema,
]).superRefine((data, ctx) => {
    // Validación cruzada de fechas
    if (data.expirationDate <= data.startDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'La fecha de vencimiento debe ser posterior a la fecha de inicio',
            path: ['expirationDate'],
        });
    }
    // BUY_X_GET_Y: productos requeridos
    if (data.type === 'BUY_X_GET_Y' && (!data.products || data.products.length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Debes seleccionar al menos un producto para la promoción Compra X Lleva Y',
            path: ['products'],
        });
    }
});

export type PromotionFormValues = z.infer<typeof promotionSchema>;
export type PromotionType = PromotionFormValues['type'];
