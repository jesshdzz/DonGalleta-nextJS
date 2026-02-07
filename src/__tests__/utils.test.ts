import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('utilidad cn', () => {
    it('debería combinar nombres de clases correctamente', () => {
        expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('debería manejar clases condicionales', () => {
        expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
    });

    it('debería manejar arrays y objetos', () => {
        // clsx supports arrays, but cn signature in utils.ts is (...inputs: ClassValue[]).
        // ClassValue from clsx includes arrays.
        expect(cn(['class1', 'class2'])).toBe('class1 class2');
    });

    it('debería combinar clases de tailwind correctamente', () => {
        // twMerge overrides conflicting classes
        expect(cn('p-4', 'p-2')).toBe('p-2');
        expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });
});
