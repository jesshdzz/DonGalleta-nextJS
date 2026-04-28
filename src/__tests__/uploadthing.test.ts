import { describe, it, expect, vi } from 'vitest';
import { ourFileRouter } from '../app/api/uploadthing/core';
import { auth } from '@/auth';

// Mock everything from uploadthing/next
vi.mock("uploadthing/next", () => {
    return {
        createUploadthing: () => {
            return () => ({
                middleware: (mwFn: unknown) => ({
                    onUploadComplete: (ucFn: unknown) => ({
                        // Expose the configured functions for testing
                        __test_middleware: mwFn,
                        __test_onUploadComplete: ucFn,
                    })
                })
            });
        }
    };
});

vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

describe('HU-28: Subir imágenes de productos a la nube', () => {

    // Since we mocked the builder, ourFileRouter.productImage is an object 
    // containing the test hooks we exposed. We cast it to any to access them.
    const productImageRoute = ourFileRouter.productImage as any;

    it('HU-28: Debería ejecutar el middleware y asignar el rol correcto', async () => {
        // Mock Admin session
        vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'admin1', role: 'ADMIN' } } as any);
        const middlewareResult = await productImageRoute.__test_middleware();
        expect(middlewareResult).toEqual({ userId: 'admin1' });
    });

    it('HU-28: Debería manejar onUploadComplete y retornar la url del archivo', async () => {
        // En el código original onUploadComplete recibe { metadata, file }
        // y retorna { url: file.url }

        // Mock console.log to avoid noise in test output
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        const mockMetadata = { userId: "AdminTest" };
        const mockFile = { url: "https://utfs.io/f/test-image.png" };

        const result = await productImageRoute.__test_onUploadComplete({
            metadata: mockMetadata,
            file: mockFile
        });

        // Verificamos que los logs sucedieron con los datos esperados
        expect(consoleSpy).toHaveBeenCalledWith("Upload completo por administrador ID:", "AdminTest");
        expect(consoleSpy).toHaveBeenCalledWith("URL del archivo:", "https://utfs.io/f/test-image.png");

        // Verificamos el valor de retorno para el cliente
        expect(result).toEqual({ url: "https://utfs.io/f/test-image.png" });

        consoleSpy.mockRestore();
    });
});
