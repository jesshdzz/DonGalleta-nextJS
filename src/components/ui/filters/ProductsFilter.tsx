'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Flavor = {
  id: number;
  name: string;
};

interface ProductFiltersProps {
  availableFlavors: Flavor[];
}

export default function ProductFilters({ availableFlavors }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedFlavors =
    searchParams.get('flavors')?.split(',') ?? [];

  const toggleFlavor = (flavorName: string) => {
    const newSelection = selectedFlavors.includes(flavorName)
      ? selectedFlavors.filter((f) => f !== flavorName)
      : [...selectedFlavors, flavorName];

    const params = new URLSearchParams(searchParams.toString());

    if (newSelection.length > 0) {
      params.set('flavors', newSelection.join(','));
    } else {
      params.delete('flavors');
    }

    startTransition(() => {
      router.push(`/productos?${params.toString()}`);
    });
  };

  return (
    <aside className="w-full md:w-56 p-4 border border-border/50 rounded-xl bg-card shadow-sm h-fit">
      <h2 className="font-serif text-xl font-bold mb-4 text-primary">
        Filtrar por sabor
      </h2>

      <div className="space-y-3">
        {availableFlavors.map((flavor) => (
          <div key={flavor.id} className="flex items-center space-x-2">
            <Checkbox
              id={`flavor-${flavor.id}`}
              checked={selectedFlavors.includes(flavor.name)}
              onCheckedChange={() => toggleFlavor(flavor.name)}
            />
            <Label
              htmlFor={`flavor-${flavor.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {flavor.name}
            </Label>
          </div>
        ))}

        {availableFlavors.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No hay filtros disponibles.</p>
        )}
      </div>

      {isPending && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
          Actualizando...
        </div>
      )}
    </aside>
  );
}
