import { describe, it, expect } from 'vitest';
import { shouldHideLayout } from '../lib/constants';

describe('HU-05: shouldHideLayout', () => {
    it('HU-05: debería retornar true para rutas ocultas', () => {
        expect(shouldHideLayout('/auth/login')).toBe(true);
        expect(shouldHideLayout('/auth/register')).toBe(true);
        expect(shouldHideLayout('/contacto')).toBe(true);
    });

    it('HU-05: debería retornar false para rutas visibles', () => {
        expect(shouldHideLayout('/')).toBe(false);
        expect(shouldHideLayout('/productos')).toBe(false);
        expect(shouldHideLayout('/admin')).toBe(false);
        expect(shouldHideLayout('/auth/login/verify')).toBe(false);
    });
});
