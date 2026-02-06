'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

const FLAVORS = [
  'Chocolate',
  'Avena',
  'Vainilla',
  'Fresa',
];

export default function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedFlavors =
    searchParams.get('flavors')?.split(',') ?? [];

  const toggleFlavor = (flavor: string) => {
    const newSelection = selectedFlavors.includes(flavor)
      ? selectedFlavors.filter((f) => f !== flavor)
      : [...selectedFlavors, flavor];

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
    <aside className="w-full md:w-40 p-4 border rounded-lg mb-6 md:mb-0">
      <h2 className="font-semibold text-lg mb-4">
        Filtrar por sabor
      </h2>

      <div className="space-y-2">
        {FLAVORS.map((flavor) => (
          <label
            key={flavor}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedFlavors.includes(flavor)}
              onChange={() => toggleFlavor(flavor)}
              className="accent-black"
            />
            <span>{flavor}</span>
          </label>
        ))}
      </div>

      {isPending && (
        <p className="text-sm text-gray-500 mt-4">
          Actualizando productos…
        </p>
      )}
    </aside>
  );
}
