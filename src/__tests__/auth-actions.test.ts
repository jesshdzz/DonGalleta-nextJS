import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUser } from '../actions/auth-actions';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
    },
}));

vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn(),
    },
}));

describe('registerUser', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debería retornar error para datos inválidos', async () => {
        const formData = new FormData();
        formData.append('email', 'not-an-email');
        formData.append('password', '123'); // Too short
        formData.append('name', '');

        const result = await registerUser(formData);

        expect(result.success).toBe(false);
        expect(result.errors).toBeDefined();
    });

    it('debería retornar error si el usuario ya existe', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: '1', email: 'test@example.com' } as any);

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');
        formData.append('name', 'Test User');

        const result = await registerUser(formData);

        expect(result.success).toBe(false);
        expect(result.errors?.email).toContain('El correo electrónico ya está registrado');
        expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('debería crear el usuario exitosamente', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
        vi.mocked(bcrypt.hash).mockResolvedValueOnce('hashed-password' as never);
        vi.mocked(prisma.user.create).mockResolvedValueOnce({ id: '1' } as any);

        const formData = new FormData();
        formData.append('email', 'new@example.com');
        formData.append('password', 'password123');
        formData.append('name', 'New User');

        const result = await registerUser(formData);

        expect(result.success).toBe(true);
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
        expect(prisma.user.create).toHaveBeenCalledWith({
            data: {
                email: 'new@example.com',
                password: 'hashed-password',
                name: 'New User',
                role: 'USER',
            },
        });
    });

    it('debería manejar errores de base de datos', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
        vi.mocked(bcrypt.hash).mockResolvedValueOnce('hashed_pw' as never);
        vi.mocked(prisma.user.create).mockRejectedValueOnce(new Error('DB Error'));

        const formData = new FormData();
        formData.append('email', 'error@example.com');
        formData.append('password', 'password123');
        formData.append('name', 'Error User');

        const result = await registerUser(formData);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Error al crear el usuario');
    });
});
