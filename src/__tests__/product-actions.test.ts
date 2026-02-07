import { describe, it, expect, vi, beforeEach } from 'vitest';
import { upsertProduct } from '../actions/product-actions';
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

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
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
            },
        });
        expect(revalidatePath).toHaveBeenCalledWith('/admin/products');
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
        vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

        const { getProducts } = await import('../actions/product-actions');
        const result = await getProducts();

        expect(result).toHaveLength(2);
        expect(result[0].price).toBe(10.5);
        expect(result[1].price).toBe(20.0);
    });
});

describe('checkStock', () => {
    it('debería retornar el stock correcto', async () => {
        vi.mocked(prisma.product.findUnique).mockResolvedValue({ stock: 15 } as any);
        const { checkStock } = await import('../actions/product-actions');
        const stock = await checkStock(1);
        expect(stock).toBe(15);
    });

    it('debería retornar 0 si el producto no se encuentra', async () => {
        vi.mocked(prisma.product.findUnique).mockResolvedValue(null);
        const { checkStock } = await import('../actions/product-actions');
        const stock = await checkStock(999);
        expect(stock).toBe(0);
    });
});

describe('checkout', () => {
    it('debería fallar si el stock es insuficiente', async () => {
        // Mock checkStock behavior (findUnique)
        vi.mocked(prisma.product.findUnique).mockResolvedValue({ stock: 1 } as any);

        const { checkout } = await import('../actions/product-actions');
        const result = await checkout([{ productId: 1, quantity: 5 }]);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Stock insuficiente');
    });

    it('debería tener éxito y actualizar el stock', async () => {
        vi.mocked(prisma.product.findUnique).mockResolvedValue({ stock: 100 } as any);
        vi.mocked(prisma.$transaction).mockResolvedValue([]);

        const { checkout } = await import('../actions/product-actions');
        const result = await checkout([{ productId: 1, quantity: 5 }]);

        expect(result.success).toBe(true);
        expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('debería manejar errores durante el checkout', async () => {
        vi.mocked(prisma.product.findUnique).mockResolvedValue({ stock: 100 } as any);
        vi.mocked(prisma.$transaction).mockRejectedValue(new Error('Tx Failed'));

        const { checkout } = await import('../actions/product-actions');
        const result = await checkout([{ productId: 1, quantity: 5 }]);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Error al procesar la compra');
    });
});

describe('deleteProduct', () => {
    it('debería eliminar el producto exitosamente', async () => {
        vi.mocked(prisma.product.delete).mockResolvedValue({} as any);
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

describe('getFlavors', () => {
    it('debería retornar sabores', async () => {
        const mockFlavors = [{ id: 1, name: 'Vainilla' }];
        vi.mocked(prisma.flavor.findMany).mockResolvedValue(mockFlavors as any);
        const { getFlavors } = await import('../actions/product-actions');
        const result = await getFlavors();
        expect(result).toEqual(mockFlavors);
    });
});
