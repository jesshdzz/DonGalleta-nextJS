import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUser, requestPasswordReset, resetPassword } from '../actions/auth-actions';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        passwordResetToken: {
            deleteMany: vi.fn(),
            create: vi.fn(),
            findUnique: vi.fn(),
            delete: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn(),
    },
}));

vi.mock('nodemailer', () => ({
    default: {
        createTransport: vi.fn().mockReturnValue({
            sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
        }),
    },
}));

vi.mock('@react-email/render', () => ({
    render: vi.fn().mockResolvedValue('<html>email</html>'),
}));

describe('registerUser', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn().mockResolvedValue({
            json: vi.fn().mockResolvedValue({ success: true })
        } as never);
    });

    it('debería retornar error para datos inválidos', async () => {
        const formData = new FormData();
        formData.append('cf-turnstile-response', 'valid-token');
        formData.append('email', 'not-an-email');
        formData.append('password', '123'); // Too short
        formData.append('name', '');

        const result = await registerUser(formData);

        expect(result.success).toBe(false);
        expect(result.errors).toBeDefined();
    });

    it('debería retornar error si el usuario ya existe', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: '1', email: 'test@example.com' } as never);

        const formData = new FormData();
        formData.append('cf-turnstile-response', 'valid-token');
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
        vi.mocked(prisma.user.create).mockResolvedValueOnce({ id: '1' } as never);

        const formData = new FormData();
        formData.append('cf-turnstile-response', 'valid-token');
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
        formData.append('cf-turnstile-response', 'valid-token');
        formData.append('email', 'error@example.com');
        formData.append('password', 'password123');
        formData.append('name', 'Error User');

        const result = await registerUser(formData);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Error al crear el usuario');
    });
});

// ─── HU-14: Restablecer mi contraseña por correo si la olvido ────────────────

describe('HU-14: Solicitar restablecimiento de contraseña', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('HU-14: debería retornar error si el correo tiene formato inválido', async () => {
        const result = await requestPasswordReset('not-an-email');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Correo electrónico inválido.');
        expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('HU-14: debería retornar success genérico si el usuario no existe (sin revelar información)', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

        const result = await requestPasswordReset('noexiste@example.com');

        expect(result.success).toBe(true);
        expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
    });

    it('HU-14: debería retornar error si la cuenta usa proveedor externo (OAuth)', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
            id: 'user-1',
            email: 'oauth@example.com',
            name: 'OAuth User',
            password: null,
        } as never);

        const result = await requestPasswordReset('oauth@example.com');

        expect(result.success).toBe(false);
        expect(result.message).toContain('proveedor externo');
        expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
    });

    it('HU-14: debería crear el token y enviar el correo exitosamente', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
            id: 'user-1',
            email: 'usuario@example.com',
            name: 'Usuario Test',
            password: 'hashed-password',
        } as never);
        vi.mocked(prisma.passwordResetToken.deleteMany).mockResolvedValueOnce({ count: 0 } as never);
        vi.mocked(prisma.passwordResetToken.create).mockResolvedValueOnce({} as never);

        const result = await requestPasswordReset('usuario@example.com');

        expect(result.success).toBe(true);
        expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
            where: { userId: 'user-1' },
        });
        expect(prisma.passwordResetToken.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ userId: 'user-1' }),
            })
        );
    });
});

describe('HU-14: Confirmar nueva contraseña con token', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('HU-14: debería retornar error si la nueva contraseña es muy corta', async () => {
        const result = await resetPassword('valid-token', '123');

        expect(result.success).toBe(false);
        expect(result.message).toBe('La contraseña debe tener al menos 6 caracteres');
        expect(prisma.passwordResetToken.findUnique).not.toHaveBeenCalled();
    });

    it('HU-14: debería retornar error si el token no existe', async () => {
        vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValueOnce(null);

        const result = await resetPassword('token-invalido', 'nuevapass123');

        expect(result.success).toBe(false);
        expect(result.message).toBe('El enlace de restablecimiento no es válido.');
        expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('HU-14: debería retornar error si el token ha expirado y eliminarlo', async () => {
        const expiredDate = new Date(Date.now() - 1000); // 1 segundo en el pasado
        vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValueOnce({
            token: 'expired-token',
            userId: 'user-1',
            expiresAt: expiredDate,
            user: { id: 'user-1' },
        } as never);
        vi.mocked(prisma.passwordResetToken.delete).mockResolvedValueOnce({} as never);

        const result = await resetPassword('expired-token', 'nuevapass123');

        expect(result.success).toBe(false);
        expect(result.message).toBe('El enlace ha expirado. Solicita uno nuevo.');
        expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({
            where: { token: 'expired-token' },
        });
        expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('HU-14: debería actualizar la contraseña y eliminar el token exitosamente', async () => {
        const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hora en el futuro
        vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValueOnce({
            token: 'valid-token',
            userId: 'user-1',
            expiresAt: futureDate,
            user: { id: 'user-1' },
        } as never);
        vi.mocked(bcrypt.hash).mockResolvedValueOnce('nueva-hashed-password' as never);
        vi.mocked(prisma.$transaction).mockResolvedValueOnce([{}, {}] as never);

        const result = await resetPassword('valid-token', 'nuevapass123');

        expect(result.success).toBe(true);
        expect(bcrypt.hash).toHaveBeenCalledWith('nuevapass123', 10);
        expect(prisma.$transaction).toHaveBeenCalled();
    });
});

