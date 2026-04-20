"use client";

import { useEffect, useState } from "react";
import { UserAddress } from "@prisma/client";
import { MapPin, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserAddresses } from "@/actions/address-actions";
import { AddressCard } from "./AddressCard";
import { AddressFormModal } from "./AddressFormModal";

export function AddressManager() {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAddresses = async () => {
    setIsLoading(true);
    const res = await getUserAddresses();
    if (res.success && res.addresses) {
      setAddresses(res.addresses);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  return (
    <Card id="direcciones" className="border-[#A6A3A2]/40 shadow-sm mt-8 scroll-mt-24">
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl text-[#58321D] flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mis Direcciones
          </CardTitle>
          <CardDescription>
            Administra tus direcciones de entrega para agilizar tus compras.
          </CardDescription>
        </div>
        <AddressFormModal 
          onSuccess={loadAddresses}
          trigger={
            <Button size="sm" className="hidden sm:flex shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Dirección
            </Button>
          }
        />
      </CardHeader>
      
      <CardContent>
        {/* Mobile "Add Address" button */}
        <div className="mb-4 sm:hidden">
          <AddressFormModal 
            onSuccess={loadAddresses}
            trigger={
              <Button size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Dirección
              </Button>
            }
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          </div>
        ) : addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <AddressCard 
                key={address.id} 
                address={address} 
                onUpdate={loadAddresses}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 border-2 border-dashed border-border/60 rounded-lg bg-secondary/10">
            <div className="bg-background w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-border/50">
              <MapPin className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">Aún no tienes direcciones</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
              Agrega tu primera dirección para que el proceso de pago sea mucho más rápido.
            </p>
            <AddressFormModal 
              onSuccess={loadAddresses}
              trigger={
                <Button variant="outline" className="mx-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Dirección
                </Button>
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
