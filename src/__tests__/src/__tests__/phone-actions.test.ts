import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. MOCKEAMOS LAS DEPENDENCIAS DEL SERVIDOR
vi.mock('next/server', () => ({}));
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

// Simulamos que el usuario tiene la sesión iniciada
vi.mock('@/auth', () => ({
    auth: vi.fn().mockResolvedValue({
        user: {
            id: 'user-123',
            name: 'Usuario Prueba',
            email: 'prueba@dongalleta.com'
        }
    }),
}));

vi.mock('uploadthing/server', () => ({
    UTApi: class {
        deleteFiles = vi.fn();
    }
}));

// 2. Mockeamos Prisma (¡Ahora incluimos findUnique!)
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(), // <-- Esto faltaba
            update: vi.fn(),
        },
    },
}));

// 3. Importamos la acción después de declarar los mocks
import { updatePhoneNumber } from '@/actions/user-actions';
import { prisma } from '@/lib/prisma';

describe('HU-64 y HU-65: Gestión de número telefónico', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('HU-64: debería guardar un número telefónico con formato válido', async () => {
        // Simulamos que SÍ encuentra al usuario en la BD
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-123' } as any);
        // Simulamos que la base de datos responde exitosamente al actualizar
        vi.mocked(prisma.user.update).mockResolvedValue({} as any);

        const result = await updatePhoneNumber('user-123', '9531234567');

        expect(result.success).toBe(true);
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user-123' },
            data: { phoneNumber: '9531234567' },
        });
    });

    it('HU-64 / HU-65: debería rechazar un número con letras o formato inválido', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-123' } as any);

        // Intentamos guardar letras en lugar de números
        const result = await updatePhoneNumber('user-123', 'abc1234567');

        expect(result.success).toBe(false);
        expect(result.error).toBe('El número telefónico debe contener entre 10 y 15 dígitos y solo números.');
        expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('HU-65: debería actualizar un número telefónico existente por uno nuevo', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-123' } as any);
        vi.mocked(prisma.user.update).mockResolvedValue({} as any);

        // Simulamos la actualización con un nuevo número
        const result = await updatePhoneNumber('user-123', '5511223344');

        expect(result.success).toBe(true);
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user-123' },
            data: { phoneNumber: '5511223344' },
        });
    });
});