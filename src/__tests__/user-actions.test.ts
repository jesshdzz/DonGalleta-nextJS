import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    updateEmail,
    updatePassword,
    deleteAccount,
    getAllUsers,
} from '../actions/user-actions';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

vi.mock('bcryptjs', () => ({
    default: {
        compare: vi.fn(),
        hash: vi.fn(),
    },
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const MOCK_USER = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-password',
};

// ---------------------------------------------------------------------------
// updateEmail
// ---------------------------------------------------------------------------
describe('updateEmail', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('HU-11: debería retornar error si el correo tiene formato inválido', async () => {
        const result = await updateEmail('user-1', 'not-an-email', 'pass123');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Correo inválido');
        expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('HU-11: debería retornar error si el usuario no tiene contraseña (cuenta OAuth)', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: 'user-1', password: null } as any);

        const result = await updateEmail('user-1', 'new@example.com', 'pass123');

        expect(result.success).toBe(false);
        expect(result.message).toBe('No se puede cambiar el correo en esta cuenta.');
    });

    it('HU-11: debería retornar error si usuario no existe', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

        const result = await updateEmail('user-1', 'new@example.com', 'pass123');

        expect(result.success).toBe(false);
        expect(result.message).toBe('No se puede cambiar el correo en esta cuenta.');
    });

    it('HU-11: debería retornar error si la contraseña actual es incorrecta', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(MOCK_USER as any);
        vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

        const result = await updateEmail('user-1', 'new@example.com', 'wrong-pass');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Contraseña actual incorrecta.');
        expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('HU-11: debería retornar error si el nuevo correo ya está en uso', async () => {
        vi.mocked(prisma.user.findUnique)
            .mockResolvedValueOnce(MOCK_USER as any)           // busca usuario actual
            .mockResolvedValueOnce({ id: 'other-user' } as any); // correo ya existe
        vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

        const result = await updateEmail('user-1', 'taken@example.com', 'pass123');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Este correo ya está en uso.');
        expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('HU-11: debería actualizar el correo exitosamente', async () => {
        vi.mocked(prisma.user.findUnique)
            .mockResolvedValueOnce(MOCK_USER as any) // usuario actual
            .mockResolvedValueOnce(null);            // nuevo correo libre
        vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);
        vi.mocked(prisma.user.update).mockResolvedValueOnce({} as any);

        const result = await updateEmail('user-1', 'new@example.com', 'pass123');

        expect(result.success).toBe(true);
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: { email: 'new@example.com' },
        });
        expect(revalidatePath).toHaveBeenCalledWith('/perfil');
    });
});

// ---------------------------------------------------------------------------
// updatePassword
// ---------------------------------------------------------------------------
describe('updatePassword', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('HU-11: debería retornar error si la nueva contraseña es muy corta', async () => {
        const result = await updatePassword('user-1', 'pass123', '123');

        expect(result.success).toBe(false);
        expect(result.message).toBe('La contraseña debe tener al menos 6 caracteres');
        expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('HU-11: debería retornar error si el usuario no tiene contraseña (cuenta OAuth)', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: 'user-1', password: null } as any);

        const result = await updatePassword('user-1', 'pass123', 'newpassword');

        expect(result.success).toBe(false);
        expect(result.message).toBe('No se puede cambiar la contraseña en esta cuenta.');
    });

    it('HU-11: debería retornar error si la contraseña actual es incorrecta', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(MOCK_USER as any);
        vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

        const result = await updatePassword('user-1', 'wrong-pass', 'newpassword');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Contraseña actual incorrecta.');
        expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('HU-11: debería actualizar la contraseña exitosamente', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(MOCK_USER as any);
        vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);
        vi.mocked(bcrypt.hash).mockResolvedValueOnce('new-hashed-password' as never);
        vi.mocked(prisma.user.update).mockResolvedValueOnce({} as any);

        const result = await updatePassword('user-1', 'pass123', 'newpassword');

        expect(result.success).toBe(true);
        expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: { password: 'new-hashed-password' },
        });
        expect(revalidatePath).toHaveBeenCalledWith('/perfil');
    });
});

// ---------------------------------------------------------------------------
// deleteAccount
// ---------------------------------------------------------------------------
describe('deleteAccount', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('HU-41: debería retornar error si el usuario no tiene contraseña (cuenta OAuth)', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: 'user-1', password: null } as any);

        const result = await deleteAccount('user-1', 'pass123');

        expect(result.success).toBe(false);
        expect(result.message).toBe('No se puede eliminar esta cuenta desde aquí.');
        expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('HU-41: debería retornar error si el usuario no existe', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

        const result = await deleteAccount('user-1', 'pass123');

        expect(result.success).toBe(false);
        expect(result.message).toBe('No se puede eliminar esta cuenta desde aquí.');
    });

    it('HU-41: debería retornar error si la contraseña es incorrecta', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(MOCK_USER as any);
        vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

        const result = await deleteAccount('user-1', 'wrong-pass');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Contraseña incorrecta. No se eliminó la cuenta.');
        expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('HU-41: debería eliminar la cuenta exitosamente', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(MOCK_USER as any);
        vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);
        vi.mocked(prisma.user.delete).mockResolvedValueOnce({} as any);

        const result = await deleteAccount('user-1', 'pass123');

        expect(result.success).toBe(true);
        expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });
});

// ---------------------------------------------------------------------------
// getAllUsers
// ---------------------------------------------------------------------------
describe('getAllUsers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debería retornar todos los usuarios con el conteo de órdenes', async () => {
        const mockUsers = [
            { id: 'user-1', email: 'a@a.com', _count: { orders: 3 } },
            { id: 'user-2', email: 'b@b.com', _count: { orders: 0 } },
        ];
        vi.mocked(prisma.user.findMany).mockResolvedValueOnce(mockUsers as any);

        const result = await getAllUsers();

        expect(result).toEqual(mockUsers);
        expect(prisma.user.findMany).toHaveBeenCalledWith({
            orderBy: { id: 'desc' },
            include: {
                _count: {
                    select: { orders: true },
                },
            },
        });
    });

    it('debería retornar un arreglo vacío si no hay usuarios', async () => {
        vi.mocked(prisma.user.findMany).mockResolvedValueOnce([]);

        const result = await getAllUsers();

        expect(result).toEqual([]);
    });
});
