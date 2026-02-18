import { describe, it, expect, vi, afterEach } from 'vitest';
import { sendContactMessage } from '../actions/contact-actions';

describe('sendContactMessage', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('debería retornar error si la validación falla', async () => {
        const formData = new FormData();
        formData.append('name', ''); // Empty
        formData.append('email', 'invalid-email');
        formData.append('message', 'Short');

        const result = await sendContactMessage(null, formData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Por favor corrige los errores en el formulario');
        expect(result.errors).toBeDefined();
        expect(result.errors).toHaveProperty('name');
        expect(result.errors).toHaveProperty('email');
    });

    it('debería enviar el mensaje exitosamente con datos válidos', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        const formData = new FormData();
        formData.append('name', 'John Doe');
        formData.append('email', 'john@example.com');
        formData.append('message', 'Hello, this is a valid message.');

        const result = await sendContactMessage(null, formData);

        expect(result.success).toBe(true);
        expect(result.message).toContain('correctamente');
        expect(consoleSpy).toHaveBeenCalled(); // Verifies logic path was taken
    });

    it('debería manejar errores correctamente', async () => {
        // To test the catch block, we need to make something throw inside the try block.
        // The try block logs and waits. We can mock console.log to throw.
        vi.spyOn(console, 'log').mockImplementation(() => { throw new Error('Forced Error'); });
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const formData = new FormData();
        formData.append('name', 'John Doe');
        formData.append('email', 'john@example.com');
        formData.append('message', 'Valid message');

        const result = await sendContactMessage(null, formData);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Hubo un error');
        expect(consoleErrorSpy).toHaveBeenCalled();
    });
});
