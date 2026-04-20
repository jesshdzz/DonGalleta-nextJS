"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createAddress, updateAddress, AddressFormValues } from "@/actions/address-actions";
import { UserAddress } from "@prisma/client";

const AddressSchema = z.object({
  alias: z.string().optional(),
  street: z.string().min(1, "La calle es requerida"),
  externalNumber: z.string().min(1, "El número exterior es requerido"),
  internalNumber: z.string().optional(),
  neighborhood: z.string().min(1, "La colonia es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
  state: z.string().min(1, "El estado es requerido"),
  zipCode: z.string().min(1, "El código postal es requerido"),
  references: z.string().optional(),
  isDefault: z.boolean().optional(),
});

interface Props {
  address?: UserAddress;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddressFormModal({ address, trigger, open, onOpenChange, onSuccess }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      alias: address?.alias || "",
      street: address?.street || "",
      externalNumber: address?.externalNumber || "",
      internalNumber: address?.internalNumber || "",
      neighborhood: address?.neighborhood || "",
      city: address?.city || "",
      state: address?.state || "",
      zipCode: address?.zipCode || "",
      references: address?.references || "",
      isDefault: address?.isDefault || false,
    },
  });

  const isDefault = watch("isDefault");

  const onSubmit = async (data: AddressFormValues) => {
    let res;
    if (address) {
      res = await updateAddress(address.id, data);
    } else {
      res = await createAddress(data);
    }

    if (res.success) {
      toast.success(address ? "Dirección actualizada" : "Dirección guardada");
      handleOpenChange(false);
      reset();
      if (onSuccess) onSuccess();
    } else {
      toast.error(res.error || "Ocurrió un error");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
      handleOpenChange(val);
      if (!val) reset();
    }}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {address ? "Editar Dirección" : "Nueva Dirección"}
          </DialogTitle>
          <DialogDescription>
            {address ? "Modifica los datos de tu dirección de entrega." : "Ingresa los detalles para tu nueva dirección de entrega."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="alias">Alias (Opcional)</Label>
              <Input id="alias" placeholder="Ej. Casa, Oficina..." {...register("alias")} disabled={isSubmitting} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="street">Calle</Label>
              <Input id="street" {...register("street")} disabled={isSubmitting} />
              {errors.street && <p className="text-xs text-destructive">{errors.street.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalNumber">Nº Exterior</Label>
              <Input id="externalNumber" {...register("externalNumber")} disabled={isSubmitting} />
              {errors.externalNumber && <p className="text-xs text-destructive">{errors.externalNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="internalNumber">Nº Interior (Opcional)</Label>
              <Input id="internalNumber" {...register("internalNumber")} disabled={isSubmitting} />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="neighborhood">Colonia</Label>
              <Input id="neighborhood" {...register("neighborhood")} disabled={isSubmitting} />
              {errors.neighborhood && <p className="text-xs text-destructive">{errors.neighborhood.message}</p>}
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="zipCode">Código Postal</Label>
              <Input id="zipCode" {...register("zipCode")} disabled={isSubmitting} />
              {errors.zipCode && <p className="text-xs text-destructive">{errors.zipCode.message}</p>}
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" {...register("city")} disabled={isSubmitting} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="state">Estado</Label>
              <Input id="state" {...register("state")} disabled={isSubmitting} />
              {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="references">Referencias (Opcional)</Label>
              <Input id="references" placeholder="Entre calles, color de fachada..." {...register("references")} disabled={isSubmitting} />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="isDefault" 
              checked={isDefault}
              onCheckedChange={(checked) => setValue("isDefault", checked as boolean)}
              disabled={isSubmitting}
            />
            <Label htmlFor="isDefault" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Establecer como dirección principal
            </Label>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {address ? "Guardar Cambios" : "Guardar Dirección"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
