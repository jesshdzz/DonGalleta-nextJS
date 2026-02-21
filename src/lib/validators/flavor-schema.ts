import { z } from "zod";

export const flavorSchema = z.object({
    name: z.string().min(2, "El nombre del sabor debe tener al menos 2 caracteres"),
});

export type FlavorFormValues = z.infer<typeof flavorSchema>;
