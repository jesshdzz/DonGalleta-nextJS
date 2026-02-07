import { describe, it, expect } from 'vitest';
import { shouldHideLayout } from '../lib/constants';

describe('shouldHideLayout', () => {
    it('debería retornar true para rutas ocultas', () => {
        expect(shouldHideLayout('/auth/login')).toBe(true);
        expect(shouldHideLayout('/auth/register')).toBe(true);
        expect(shouldHideLayout('/contacto')).toBe(true);
    });

    it('debería retornar false para rutas visibles', () => {
        expect(shouldHideLayout('/')).toBe(false);
        expect(shouldHideLayout('/productos')).toBe(false);
        expect(shouldHideLayout('/admin')).toBe(false);
        // Partial matches shouldn't work unless logic changes. Currently exact match.
        expect(shouldHideLayout('/auth/login/verify')).toBe(false);
    });
});
