import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  // Zod recibe strings de los inputs HTML, hay que transformarlos a números
  price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  slug: z.string().min(3, "El slug es obligatorio y debe ser único"),
  image: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof productSchema>;