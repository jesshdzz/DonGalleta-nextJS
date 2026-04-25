import { describe, it, expect } from 'vitest';
import { calculatePromotionsDiscount, type Promotion, type CartItem } from '../lib/calculate-promotions';

describe('HU-53: calculatePromotionsDiscount', () => {
    const products = {
        cookieA: { productId: 1, price: 10, quantity: 5 }, // Total 50
        cookieB: { productId: 2, price: 20, quantity: 2 }, // Total 40
        cookieC: { productId: 3, price: 30, quantity: 1 }, // Total 30
    };

    it('HU-53: debería retornar 0 si no hay promociones', () => {
        const cart: CartItem[] = [products.cookieA];
        const promotions: Promotion[] = [];
        const discount = calculatePromotionsDiscount(cart, promotions);
        expect(discount).toBe(0);
    });

    it('HU-53: debería aplicar un descuento porcentual global', () => {
        const cart: CartItem[] = [products.cookieA]; // 50
        const promotions: Promotion[] = [
            {
                id: 1,
                name: '10% Off Global',
                type: 'PERCENTAGE',
                value: 10,
                minOrderAmount: 0,
                buyQuantity: null,
                getQuantity: null,
                applicableProductIds: [],
            }
        ];
        const discount = calculatePromotionsDiscount(cart, promotions);
        expect(discount).toBe(5); // 10% of 50
    });

    it('HU-53: debería aplicar un descuento fijo global', () => {
        const cart: CartItem[] = [products.cookieA]; // 50
        const promotions: Promotion[] = [
            {
                id: 1,
                name: '$5 Off Global',
                type: 'FIXED',
                value: 5,
                minOrderAmount: 0,
                buyQuantity: null,
                getQuantity: null,
                applicableProductIds: [],
            }
        ];
        const discount = calculatePromotionsDiscount(cart, promotions);
        expect(discount).toBe(5);
    });

    it('HU-53: debería aplicar descuento solo a productos específicos', () => {
        const cart: CartItem[] = [products.cookieA, products.cookieB]; // 50 + 40 = 90
        const promotions: Promotion[] = [
            {
                id: 1,
                name: '10% Off Cookie A',
                type: 'PERCENTAGE',
                value: 10,
                minOrderAmount: 0,
                buyQuantity: null,
                getQuantity: null,
                applicableProductIds: [1],
            }
        ];
        const discount = calculatePromotionsDiscount(cart, promotions);
        expect(discount).toBe(5); // 10% of 50, cookieB (40) ignored
    });

    it('HU-53: debería respetar el monto mínimo de pedido', () => {
        const cart: CartItem[] = [products.cookieA]; // 50
        const promotions: Promotion[] = [
            {
                id: 1,
                name: '10% Off orders > $100',
                type: 'PERCENTAGE',
                value: 10,
                minOrderAmount: 100,
                buyQuantity: null,
                getQuantity: null,
                applicableProductIds: [],
            }
        ];
        const discount = calculatePromotionsDiscount(cart, promotions);
        expect(discount).toBe(0);

        const cartLarge: CartItem[] = [{ ...products.cookieA, quantity: 15 }]; // 150
        const discountLarge = calculatePromotionsDiscount(cartLarge, promotions);
        expect(discountLarge).toBe(15); // 10% of 150
    });

    describe('HU-53: BUY_X_GET_Y', () => {
        it('HU-53: debería aplicar 2x1 (Lleva 2, paga 1)', () => {
            const cart: CartItem[] = [{ productId: 1, price: 10, quantity: 2 }];
            const promotions: Promotion[] = [
                {
                    id: 1,
                    name: '2x1',
                    type: 'BUY_X_GET_Y',
                    value: 0,
                    minOrderAmount: null,
                    buyQuantity: 2,
                    getQuantity: 1,
                    applicableProductIds: [1],
                }
            ];
            const discount = calculatePromotionsDiscount(cart, promotions);
            expect(discount).toBe(10); // Un producto gratis
        });

        it('HU-53: debería aplicar 3x2 (Lleva 3, paga 2)', () => {
            const cart: CartItem[] = [{ productId: 1, price: 10, quantity: 3 }];
            const promotions: Promotion[] = [
                {
                    id: 1,
                    name: '3x2',
                    type: 'BUY_X_GET_Y',
                    value: 0,
                    minOrderAmount: null,
                    buyQuantity: 3,
                    getQuantity: 1,
                    applicableProductIds: [1],
                }
            ];
            const discount = calculatePromotionsDiscount(cart, promotions);
            expect(discount).toBe(10); // Uno gratis
        });

        it('HU-53: debería aplicar múltiples grupos de BUY_X_GET_Y', () => {
            const cart: CartItem[] = [{ productId: 1, price: 10, quantity: 7 }];
            const promotions: Promotion[] = [
                {
                    id: 1,
                    name: '3x2',
                    type: 'BUY_X_GET_Y',
                    value: 0,
                    minOrderAmount: null,
                    buyQuantity: 3,
                    getQuantity: 1,
                    applicableProductIds: [1],
                }
            ];
            // 7 productos: 2 grupos de 3 (6 productos) + 1 sobrante
            // Cada grupo de 3 tiene 1 gratis. Total 2 gratis.
            const discount = calculatePromotionsDiscount(cart, promotions);
            expect(discount).toBe(20);
        });

        it('HU-53: debería descontar los productos más baratos en BUY_X_GET_Y mezclado', () => {
            const cart: CartItem[] = [
                { productId: 1, price: 10, quantity: 2 },
                { productId: 2, price: 20, quantity: 1 },
            ];
            const promotions: Promotion[] = [
                {
                    id: 1,
                    name: '3x2 Global',
                    type: 'BUY_X_GET_Y',
                    value: 0,
                    minOrderAmount: null,
                    buyQuantity: 3,
                    getQuantity: 1,
                    applicableProductIds: [], // Global
                }
            ];
            // Total 3 productos. 1 gratis. Debería ser el de $10.
            const discount = calculatePromotionsDiscount(cart, promotions);
            expect(discount).toBe(10);
        });
    });

    it('HU-53: debería elegir el mejor descuento para PERCENTAGE vs FIXED', () => {
        const cart: CartItem[] = [products.cookieA]; // 50
        const promotions: Promotion[] = [
            {
                id: 1,
                name: '10% Off',
                type: 'PERCENTAGE',
                value: 10, // Sería $5
                minOrderAmount: 0,
                buyQuantity: null,
                getQuantity: null,
                applicableProductIds: [],
            },
            {
                id: 2,
                name: '$10 Off',
                type: 'FIXED',
                value: 10, // Sería $10
                minOrderAmount: 0,
                buyQuantity: null,
                getQuantity: null,
                applicableProductIds: [],
            }
        ];
        const discount = calculatePromotionsDiscount(cart, promotions);
        expect(discount).toBe(10); // $10 > $5
    });

    it('HU-53: no debería aplicar múltiples promociones al mismo item (prioridad BUY_X_GET_Y)', () => {
        const cart: CartItem[] = [{ productId: 1, price: 10, quantity: 2 }];
        const promotions: Promotion[] = [
            {
                id: 1,
                name: '2x1',
                type: 'BUY_X_GET_Y',
                buyQuantity: 2,
                getQuantity: 1,
                value: 0,
                minOrderAmount: null,
                applicableProductIds: [1],
            },
            {
                id: 2,
                name: '10% Off',
                type: 'PERCENTAGE',
                value: 10,
                minOrderAmount: 0,
                buyQuantity: null,
                getQuantity: null,
                applicableProductIds: [1],
            }
        ];
        // BUY_X_GET_Y se aplica primero y "consume" los items.
        // Después de 2x1, quedan 0 items.
        const discount = calculatePromotionsDiscount(cart, promotions);
        expect(discount).toBe(10); // Solo el 2x1
    });
});
