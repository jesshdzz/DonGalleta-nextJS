"use client";

import { UserAddress } from "@prisma/client";
import { MapPin, Edit, Trash2, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteAddress, setDefaultAddress } from "@/actions/address-actions";
import { toast } from "sonner";
import { AddressFormModal } from "./AddressFormModal";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  address: UserAddress;
  onUpdate: () => void;
}

export function AddressCard({ address, onUpdate }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteAddress(address.id);
    if (res.success) {
      toast.success("Dirección eliminada");
      onUpdate();
    } else {
      toast.error(res.error || "No se pudo eliminar la dirección");
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async () => {
    setIsSettingDefault(true);
    const res = await setDefaultAddress(address.id);
    if (res.success) {
      toast.success("Dirección principal actualizada");
      onUpdate();
    } else {
      toast.error(res.error || "Ocurrió un error");
    }
    setIsSettingDefault(false);
  };

  return (
    <Card className={`relative overflow-hidden transition-all ${address.isDefault ? 'border-primary/50 shadow-md ring-1 ring-primary/20' : 'border-border/50 hover:border-primary/30 hover:shadow-sm'}`}>
      {address.isDefault && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-sm">
          <Star className="h-3 w-3 fill-current" />
          Principal
        </div>
      )}
      
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-1 bg-secondary/20 p-2 rounded-full text-primary shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          
          <div className="flex-1 space-y-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground truncate">
                {address.alias || "Dirección de entrega"}
              </h4>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {address.street} {address.externalNumber}
              {address.internalNumber ? ` Int. ${address.internalNumber}` : ""}
              <br />
              Col. {address.neighborhood}, C.P. {address.zipCode}
              <br />
              {address.city}, {address.state}
            </p>
            
            {address.references && (
              <p className="text-xs text-muted-foreground/80 italic mt-1 truncate">
                Ref: {address.references}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
          {!address.isDefault ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8 text-muted-foreground hover:text-primary pl-0"
              onClick={handleSetDefault}
              disabled={isSettingDefault}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Hacer principal
            </Button>
          ) : (
            <div className="text-xs text-primary/80 font-medium px-2 py-1 bg-primary/5 rounded-md">
              Dirección de envío por defecto
            </div>
          )}

          <div className="flex items-center gap-1 ml-auto">
            <AddressFormModal 
              address={address} 
              onSuccess={onUpdate}
              trigger={
                <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-primary/5 hover:text-primary hover:border-primary/30">
                  <Edit className="h-4 w-4" />
                </Button>
              }
            />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar dirección?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Ya no podrás seleccionar esta dirección para futuros pedidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
