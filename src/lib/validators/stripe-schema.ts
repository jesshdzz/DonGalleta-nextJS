import { z } from "zod";

export const CarritoMetadataSchema = z.array(
  z.object({
    id: z.number().int().positive(),
    cantidad: z.number().int().positive(),
    precio: z.number().positive()
  })
);
