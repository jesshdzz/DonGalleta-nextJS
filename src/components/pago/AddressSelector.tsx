"use client";

import { useEffect, useState } from "react";
import { UserAddress } from "@prisma/client";
import { MapPin, Plus, Store, Star } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { getUserAddresses } from "@/actions/address-actions";
import { AddressFormModal } from "@/components/perfil/addresses/AddressFormModal";

interface Props {
  selectedAddressId: string;
  onAddressSelect: (id: string) => void;
}

export function AddressSelector({ selectedAddressId, onAddressSelect }: Props) {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadAddresses = async () => {
    setIsLoading(true);
    const res = await getUserAddresses();
    if (res.success && res.addresses) {
      setAddresses(res.addresses);
      if (!selectedAddressId && res.addresses.length > 0) {
        const defaultAddr = res.addresses.find(a => a.isDefault) || res.addresses[0];
        onAddressSelect(defaultAddr.id);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse h-24 bg-muted/50 rounded-md mb-6"></div>;
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          ¿Dónde entregamos?
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-3 w-3 mr-1" /> Nueva
        </Button>
      </div>

      <RadioGroup
        value={selectedAddressId}
        onValueChange={onAddressSelect}
        className="grid gap-3"
      >
        <div className={`flex items-start space-x-3 rounded-md border p-3 cursor-pointer transition-colors ${selectedAddressId === "pickup" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
          <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
          <Label htmlFor="pickup" className="flex-1 cursor-pointer font-normal">
            <div className="flex items-center gap-2 mb-1">
              <Store className="h-4 w-4 text-primary" />
              <span className="font-medium">Recoger en tienda</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Pasaré a recoger mi pedido directamente a la sucursal.
            </span>
          </Label>
        </div>

        {addresses.map((address) => (
          <div
            key={address.id}
            className={`relative flex items-start space-x-3 rounded-md border p-3 cursor-pointer transition-colors ${selectedAddressId === address.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
          >
            <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
            <Label htmlFor={address.id} className="flex-1 cursor-pointer font-normal pr-6">
              <div className="flex items-center mb-1">
                <span className="font-medium">{address.alias || "Dirección de entrega"}</span>
              </div>
              <span className="text-sm text-muted-foreground block">
                {address.street} {address.externalNumber}
                {address.internalNumber ? ` Int. ${address.internalNumber}` : ""}
              </span>
              <span className="text-sm text-muted-foreground block">
                Col. {address.neighborhood}, C.P. {address.zipCode}
              </span>
            </Label>
            {address.isDefault && (
              <div className="absolute top-3 right-3 flex items-center justify-center bg-primary text-primary-foreground p-1 rounded-full" title="Dirección Principal">
                <Star className="h-3.5 w-3.5 fill-current" />
              </div>
            )}
          </div>
        ))}
      </RadioGroup>

      <AddressFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          loadAddresses();
        }}
      />
    </div>
  );
}
