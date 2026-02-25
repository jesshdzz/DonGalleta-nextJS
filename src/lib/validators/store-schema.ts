import { z } from "zod";

export const storeSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  schedule: z.string().optional().or(z.literal("")),
  latitude: z.coerce.number({ error: "Debe ser un número válido" }),
  longitude: z.coerce.number({ error: "Debe ser un número válido" }),
  phone: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type StoreFormValues = z.infer<typeof storeSchema>;
