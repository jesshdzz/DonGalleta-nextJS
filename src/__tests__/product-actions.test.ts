import { describe, it, expect, vi, beforeEach } from 'vitest';
import { upsertProduct } from '../actions/product-actions';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        product: {
            create: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('upsertProduct', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a product successfully', async () => {
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

    it('should edit a product successfully', async () => {
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

    it('should fail with Zod validation errors', async () => {
        const formData = new FormData();
        formData.append('name', 'AB'); // Too short
        formData.append('description', '');
        formData.append('price', '-10'); // Negative
        formData.append('stock', '5');
        formData.append('slug', 'slug');
        formData.append('image', '');
        // isActive missing (defaults to false? no, defaults to true in schema if optional? no, schema says default(true). 
        // Wait, checkbox logic: if not present, it's false in logic?
        // Code says: `isActive: formData.get("isActive") === "on"` -> false.
        // Schema says: `isActive: z.boolean().default(true)`.
        // Valid object sent to Zod will have `isActive: false`. 
        // Zod boolean() accepts false. default(true) is used if undefined.
        // So this is valid.

        const result = await upsertProduct(null, formData);

        expect(result.success).toBe(false);
        expect(result.errors).toHaveProperty('name');
        expect(result.errors).toHaveProperty('price');
        expect(prisma.product.create).not.toHaveBeenCalled();
        expect(prisma.product.update).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
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
