import { describe, it, expect, vi, beforeEach } from 'vitest';
import { upsertProduct, searchProducts } from '../actions/product-actions';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Mock dependencies
// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        product: {
            create: vi.fn(),
            update: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            delete: vi.fn(),
        },
        flavor: {
            findMany: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

vi.mock('@/auth', () => ({
    auth: vi.fn().mockResolvedValue({ user: { id: '123' } }),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
    sendRestockAlert: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('./waiting-list-actions', () => ({
    notifyWaitingList: vi.fn().mockResolvedValue(undefined),
}));

describe('upsertProduct', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debería crear un producto exitosamente', async () => {
        const formData = new FormData();
        formData.append('name', 'New Product');
        formData.append('description', 'A great product');
        formData.append('price', '100');
        formData.append('stock', '10');
        formData.append('slug', 'new-product');
        formData.append('image', 'https://example.com/image.jpg');
        formData.append('isActive', 'on');

        const result = await upsertProduct(null, formData);

        expect(result.success).toBe(true);
        expect(prisma.product.create).toHaveBeenCalledWith({
            data: {
                name: 'New Product',
                description: 'A great product',
                price: 100,
                stock: 10,
                slug: 'new-product',
                image: 'https://example.com/image.jpg',
                isActive: true,
                flavors: {
                    create: [],
                },
            },
        });
        expect(revalidatePath).toHaveBeenCalledWith('/admin/productos');
        expect(revalidatePath).toHaveBeenCalledWith('/productos');
    });

    it('debería editar un producto exitosamente', async () => {
        const formData = new FormData();
        formData.append('id', '123');
        formData.append('name', 'Updated Product');
        formData.append('description', 'Updated description');
        formData.append('price', '200');
        formData.append('stock', '20');
        formData.append('slug', 'updated-product');
        formData.append('image', '');
        formData.append('isActive', 'on');

        const result = await upsertProduct(null, formData);

        expect(result.success).toBe(true);
        expect(prisma.product.update).toHaveBeenCalledWith({
            where: { id: 123 },
            data: {
                name: 'Updated Product',
                description: 'Updated description',
                price: 200,
                stock: 20,
                slug: 'updated-product',
                image: '',
                isActive: true,
                flavors: {
                    create: [],
                    deleteMany: {},
                },
            },
        });
        expect(revalidatePath).toHaveBeenCalledTimes(2);
    });

    it('debería fallar con errores de validación Zod', async () => {
        const formData = new FormData();
        formData.append('name', 'AB'); // Too short
        formData.append('description', '');
        formData.append('price', '-10'); // Negative
        formData.append('stock', '5');
        formData.append('slug', 'slug');
        formData.append('image', '');

        const result = await upsertProduct(null, formData);

        expect(result.success).toBe(false);
        expect(result.errors).toHaveProperty('name');
        expect(result.errors).toHaveProperty('price');
        expect(prisma.product.create).not.toHaveBeenCalled();
        expect(prisma.product.update).not.toHaveBeenCalled();
    });

    it('debería manejar errores de base de datos', async () => {
        const formData = new FormData();
        formData.append('name', 'Error Product');
        formData.append('description', 'Desc');
        formData.append('price', '100');
        formData.append('stock', '10');
        formData.append('slug', 'error-product');
        formData.append('image', '');
        formData.append('isActive', 'on');

        // Simulate DB error
        vi.mocked(prisma.product.create).mockRejectedValueOnce(new Error('DB Error'));

        const result = await upsertProduct(null, formData);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Error al guardar en base de datos');
    });
});

describe('getProducts', () => {
    it('debería retornar productos con el precio como número', async () => {
        const mockProducts = [
            { id: 1, name: 'P1', price: { toNumber: () => 10.5 }, stock: 5 },
            { id: 2, name: 'P2', price: { toNumber: () => 20.0 }, stock: 10 },
        ];
        vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as never);

        const { getProducts } = await import('../actions/product-actions');
        const result = await getProducts();

        expect(result).toHaveLength(2);
        expect(result[0].price).toBe(10.5);
        expect(result[1].price).toBe(20.0);
    });
});





describe('deleteProduct', () => {
    it('debería eliminar el producto exitosamente', async () => {
        vi.mocked(prisma.product.delete).mockResolvedValue({} as never);
        const { deleteProduct } = await import('../actions/product-actions');
        const result = await deleteProduct(1);
        expect(result.success).toBe(true);
        expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('debería manejar errores al eliminar', async () => {
        vi.mocked(prisma.product.delete).mockRejectedValue(new Error('Delete invalid'));
        const { deleteProduct } = await import('../actions/product-actions');
        const result = await deleteProduct(1);
        expect(result).not.toHaveProperty('success');
        expect(result.message).toBe('No se pudo eliminar el producto');
    });
});



describe('searchProducts', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    })
    it('debería retornar un array vacío si la query está vacía o tiene menos de 3 caracteres', async () => {
        expect(await searchProducts('')).toEqual([]);
        expect(await searchProducts('ab')).toEqual([]);

        // Verificamos que Prisma no fue llamado innecesariamente
        expect(prisma.product.findMany).not.toHaveBeenCalled();
    });

    it('debería llamar a la base de datos y formatear correctamente los productos encontrados', async () => {
        const mockPrismaProducts = [
            {
                id: '1',
                name: 'Galleta de Chocolate',
                slug: 'galleta-de-chocolate',
                price: { toNumber: () => 15.50 },
                image: 'chocolate.jpg',
                flavors: [
                    { flavor: { name: 'Chocolate' } },
                    { flavor: { name: 'Vainilla' } },
                ],
            },
        ];

        // Usamos vi.mocked para mantener tu estilo de mocks
        vi.mocked(prisma.product.findMany).mockResolvedValue(mockPrismaProducts as never);

        const query = 'choco';
        const limit = 5;
        const result = await searchProducts(query, limit);

        expect(prisma.product.findMany).toHaveBeenCalledWith({
            where: {
                isActive: true,
                OR: [
                    { name: { contains: query } },
                    { flavors: { some: { flavor: { name: { contains: query } } } } },
                ],
            },
            take: limit,
            include: {
                flavors: {
                    include: { flavor: true },
                },
            },
        });

        expect(result).toEqual([
            {
                id: '1',
                name: 'Galleta de Chocolate',
                slug: 'galleta-de-chocolate',
                price: 15.50,
                flavor: 'Chocolate, Vainilla',
                image: 'chocolate.jpg',
            },
        ]);
    });

    it('debería capturar errores, loguearlos en consola y retornar un array vacío', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const dbError = new Error('Error de conexión');

        vi.mocked(prisma.product.findMany).mockRejectedValueOnce(dbError);

        const result = await searchProducts('galleta');

        expect(consoleSpy).toHaveBeenCalledWith("Error buscando productos:", dbError);
        expect(result).toEqual([]);

        consoleSpy.mockRestore(); // Limpiamos el espía
    });
});

describe('HU-50: Seccion de Productos relacionados: getRelatedProducts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it(' HU-50 debería retornar productos relacionados por sabor sin llamar a la base secundaria si alcanza el límite', async () => {
        const { getRelatedProducts } = await import('../actions/product-actions');
        
        // Mock current product with a flavor
        vi.mocked(prisma.product.findUnique).mockResolvedValue({
            id: 1,
            flavors: [{ flavorId: 10 }]
        } as never);

        // Mock exact number of products to reach the limit
        const mockRelatedProducts = Array.from({ length: 4 }).map((_, i) => ({ id: i + 2 }));
        vi.mocked(prisma.product.findMany).mockResolvedValueOnce(mockRelatedProducts as never);

        const result = await getRelatedProducts(1, 4);

        expect(result).toHaveLength(4);
        expect(prisma.product.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            include: { flavors: true }
        });
        
        expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
        expect(prisma.product.findMany).toHaveBeenCalledWith({
            where: {
                id: { not: 1 },
                isActive: true,
                flavors: { some: { flavorId: { in: [10] } } }
            },
            take: 4,
            include: {
                flavors: { include: { flavor: true } }
            }
        });
    });

    it(' HU-50 debería rellenar con otros productos si los encontrados por sabor no alcanzan el límite', async () => {
        const { getRelatedProducts } = await import('../actions/product-actions');
        
        vi.mocked(prisma.product.findUnique).mockResolvedValue({
            id: 1,
            flavors: [{ flavorId: 10 }]
        } as never);

        // First query returns only 1 product
        const mockFirstBatch = [{ id: 2 }];
        // The fallback query returns 3 more
        const mockSecondBatch = [{ id: 3 }, { id: 4 }, { id: 5 }];

        vi.mocked(prisma.product.findMany)
            .mockResolvedValueOnce(mockFirstBatch as never)
            .mockResolvedValueOnce(mockSecondBatch as never);

        const result = await getRelatedProducts(1, 4);

        expect(result).toHaveLength(4);
        expect(prisma.product.findMany).toHaveBeenCalledTimes(2);
        
        // Verify the second findMany call arguments
        expect(prisma.product.findMany).toHaveBeenNthCalledWith(2, {
            where: {
                id: { notIn: [1, 2] },
                isActive: true
            },
            take: 3,
            orderBy: { id: 'desc' },
            include: {
                flavors: { include: { flavor: true } }
            }
        });
    });

    it(' HU-50 debería capturar errores, loguearlos en consola y retornar un array vacío', async () => {
        const { getRelatedProducts } = await import('../actions/product-actions');
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const dbError = new Error('Database Error');

        vi.mocked(prisma.product.findUnique).mockRejectedValueOnce(dbError);

        const result = await getRelatedProducts(1);

        expect(consoleSpy).toHaveBeenCalledWith("Error obteniendo productos relacionados:", dbError);
        expect(result).toEqual([]);

        consoleSpy.mockRestore(); // Limpiamos el espía
    });
});