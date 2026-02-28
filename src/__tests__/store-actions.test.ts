import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStores, upsertStore, deleteStore } from '../actions/store-actions';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        store: {
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildFormData(fields: Record<string, string>) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
        formData.append(key, value);
    }
    return formData;
}

const validStoreFields = {
    name: 'Sucursal Centro',
    address: 'Av. Principal 123',
    schedule: 'Lun-Vie 9am-6pm',
    latitude: '19.4326',
    longitude: '-99.1332',
    phone: '5551234567',
    isActive: 'on',
};

// ---------------------------------------------------------------------------
// getStores
// ---------------------------------------------------------------------------
describe('getStores', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debería retornar la lista de tiendas ordenada por fecha de creación', async () => {
        const mockStores = [
            { id: '1', name: 'Tienda A', createdAt: new Date() },
            { id: '2', name: 'Tienda B', createdAt: new Date() },
        ];
        vi.mocked(prisma.store.findMany).mockResolvedValueOnce(mockStores as never);

        const result = await getStores();

        expect(result).toEqual(mockStores);
        expect(prisma.store.findMany).toHaveBeenCalledWith({
            orderBy: { createdAt: 'desc' },
        });
    });

    it('debería retornar un arreglo vacío si no hay tiendas', async () => {
        vi.mocked(prisma.store.findMany).mockResolvedValueOnce([]);

        const result = await getStores();

        expect(result).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// upsertStore – validación
// ---------------------------------------------------------------------------
describe('upsertStore – validación', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debería retornar error si el nombre es demasiado corto', async () => {
        const formData = buildFormData({ ...validStoreFields, name: 'AB' });

        const result = await upsertStore(null, formData);

        expect(result.success).toBe(false);
        expect(result.errors).toHaveProperty('name');
        expect(prisma.store.create).not.toHaveBeenCalled();
    });

    it('debería retornar error si la dirección es demasiado corta', async () => {
        const formData = buildFormData({ ...validStoreFields, address: 'Cor' });

        const result = await upsertStore(null, formData);

        expect(result.success).toBe(false);
        expect(result.errors).toHaveProperty('address');
        expect(prisma.store.create).not.toHaveBeenCalled();
    });

    it('debería retornar error si la latitud no es un número válido', async () => {
        const formData = buildFormData({ ...validStoreFields, latitude: 'no-es-numero' });

        const result = await upsertStore(null, formData);

        expect(result.success).toBe(false);
        expect(result.errors).toHaveProperty('latitude');
        expect(prisma.store.create).not.toHaveBeenCalled();
    });

    it('debería retornar error si la longitud no es un número válido', async () => {
        const formData = buildFormData({ ...validStoreFields, longitude: 'abc' });

        const result = await upsertStore(null, formData);

        expect(result.success).toBe(false);
        expect(result.errors).toHaveProperty('longitude');
    });

    it('debería incluir el mensaje de error correcto al fallar la validación', async () => {
        const formData = buildFormData({ ...validStoreFields, name: 'X' });

        const result = await upsertStore(null, formData);

        expect(result.message).toBe('Error en los datos enviados');
    });
});

// ---------------------------------------------------------------------------
// upsertStore – creación
// ---------------------------------------------------------------------------
describe('upsertStore – creación', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debería crear una tienda exitosamente', async () => {
        vi.mocked(prisma.store.create).mockResolvedValueOnce({} as never);
        const formData = buildFormData(validStoreFields);

        const result = await upsertStore(null, formData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Sucursal guardada correctamente');
        expect(prisma.store.create).toHaveBeenCalledWith({
            data: {
                name: 'Sucursal Centro',
                address: 'Av. Principal 123',
                schedule: 'Lun-Vie 9am-6pm',
                latitude: 19.4326,
                longitude: -99.1332,
                phone: '5551234567',
                isActive: true,
            },
        });
        expect(revalidatePath).toHaveBeenCalledWith('/admin/tiendas');
    });

    it('debería marcar isActive como false cuando no se envía el checkbox', async () => {
        vi.mocked(prisma.store.create).mockResolvedValueOnce({} as never);
        // isActive ausente → formData.get("isActive") !== "on" → false
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isActive, ...rest } = validStoreFields;
        const formData = buildFormData(rest);

        await upsertStore(null, formData);

        expect(prisma.store.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ isActive: false }),
            }),
        );
    });

    it('debería manejar errores de base de datos al crear', async () => {
        vi.mocked(prisma.store.create).mockRejectedValueOnce(new Error('DB Error'));
        const formData = buildFormData(validStoreFields);

        const result = await upsertStore(null, formData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Error al guardar en base de datos.');
        expect(revalidatePath).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// upsertStore – edición
// ---------------------------------------------------------------------------
describe('upsertStore – edición', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debería editar una tienda existente exitosamente', async () => {
        vi.mocked(prisma.store.update).mockResolvedValueOnce({} as never);
        const formData = buildFormData({ id: 'store-42', ...validStoreFields });

        const result = await upsertStore(null, formData);

        expect(result.success).toBe(true);
        expect(prisma.store.update).toHaveBeenCalledWith({
            where: { id: 'store-42' },
            data: expect.objectContaining({ name: 'Sucursal Centro' }),
        });
        expect(prisma.store.create).not.toHaveBeenCalled();
        expect(revalidatePath).toHaveBeenCalledWith('/admin/tiendas');
    });

    it('debería manejar errores de base de datos al editar', async () => {
        vi.mocked(prisma.store.update).mockRejectedValueOnce(new Error('DB Error'));
        const formData = buildFormData({ id: 'store-99', ...validStoreFields });

        const result = await upsertStore(null, formData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Error al guardar en base de datos.');
    });
});

// ---------------------------------------------------------------------------
// deleteStore
// ---------------------------------------------------------------------------
describe('deleteStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debería eliminar una tienda exitosamente', async () => {
        vi.mocked(prisma.store.delete).mockResolvedValueOnce({} as never);

        const result = await deleteStore('store-1');

        expect(result.success).toBe(true);
        expect(prisma.store.delete).toHaveBeenCalledWith({ where: { id: 'store-1' } });
        expect(revalidatePath).toHaveBeenCalledWith('/admin/tiendas');
    });

    it('debería retornar mensaje de error si la eliminación falla', async () => {
        vi.mocked(prisma.store.delete).mockRejectedValueOnce(new Error('Delete failed'));

        const result = await deleteStore('store-bad');

        expect(result).not.toHaveProperty('success');
        expect(result.message).toBe('No se pudo eliminar la sucursal');
        expect(revalidatePath).not.toHaveBeenCalled();
    });
});
