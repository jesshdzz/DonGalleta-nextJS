import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDashboardStats } from '../actions/dashboard-actions';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        order: {
            findMany: vi.fn(),
        },
        product: {
            count: vi.fn(),
        },
    },
}));

describe('HU-19: Graficas de ventas', () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        // Fijamos la fecha en Mayo de 2024 para consistencia en los tests
        const mockDate = new Date(2024, 4, 15); // 15 de Mayo, 2024
        vi.setSystemTime(mockDate);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('HU-19: debería calcular estadísticas vacías cuando no hay pedidos', async () => {
        vi.mocked(prisma.order.findMany).mockResolvedValue([]);
        vi.mocked(prisma.product.count).mockResolvedValue(10);

        const stats = await getDashboardStats();

        expect(stats.totalRevenue).toBe(0);
        expect(stats.totalOrders).toBe(0);
        expect(stats.activeProducts).toBe(10);
        expect(stats.revenueChange).toBe(0);
        expect(stats.ordersChange).toBe(0);
        
        // El value de las gráficas debería ser 0%
        expect(stats.monthlySales[0].value).toBe(0);
        expect(stats.monthlyOrders[0].value).toBe(0);
        
        // Las etiquetas del eje Y deberían usar el max(..., 1) de la lógica
        expect(stats.salesYLabels).toContain('$1');
        expect(stats.ordersYLabels).toContain('1');
    });

    it('HU-19: debería agrupar pedidos por mes y calcular cambios MoM correctamente', async () => {
        // Simulamos pedidos para Abril (index 3) y Mayo (index 4)
        const mockOrders = [
            { total: { toNumber: () => 100 }, createdAt: new Date(2024, 3, 10) }, // Abril
            { total: { toNumber: () => 200 }, createdAt: new Date(2024, 3, 20) }, // Abril (Total Abril: 300)
            { total: { toNumber: () => 450 }, createdAt: new Date(2024, 4, 5) },  // Mayo (Total Mayo: 450)
        ];

        vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);
        vi.mocked(prisma.product.count).mockResolvedValue(5);

        const stats = await getDashboardStats();

        // Totales totales del año
        expect(stats.totalRevenue).toBe(750);
        expect(stats.totalOrders).toBe(3);

        // Cambio MoM (Mayo vs Abril): ((450 - 300) / 300) * 100 = 50%
        expect(stats.revenueChange).toBe(50);
        // Pedidos MoM (1 pedido en Mayo vs 2 en Abril): ((1 - 2) / 2) * 100 = -50%
        expect(stats.ordersChange).toBe(-50);
        
        // Verificación de normalización de gráfica (Max revenue es 450 Mayo)
        // Abril (index 3) value: (300 / 450) * 100 = 66.66 -> 67
        expect(stats.monthlySales[3].value).toBe(67);
        expect(stats.monthlySales[3].rawValue).toBe(300);
        
        // Mayo (index 4) value: (450 / 450) * 100 = 100
        expect(stats.monthlySales[4].value).toBe(100);
        expect(stats.monthlySales[4].rawValue).toBe(450);
    });

    it('HU-19: debería manejar el caso donde el mes anterior tiene 0 ventas sin error de división por cero', async () => {
        // Solo pedidos en Mayo, ninguno en Abril
        const mockOrders = [
            { total: { toNumber: () => 500 }, createdAt: new Date(2024, 4, 1) }, 
        ];

        vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

        const stats = await getDashboardStats();

        expect(stats.revenueChange).toBe(0); // Según la lógica: prevMonthRevenue > 0 ? ... : 0
        expect(stats.ordersChange).toBe(0);
    });

    it('HU-19: debería generar etiquetas del eje Y proporcionales al valor máximo', async () => {
        const mockOrders = [
            { total: { toNumber: () => 1000 }, createdAt: new Date(2024, 0, 1) },
        ];
        vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

        const stats = await getDashboardStats();

        // Max es 1000. Labels: Max, 750, 500, 250, 0
        // El formateador para ingresos usa "$1.0k" para >= 1000
        expect(stats.salesYLabels).toEqual(['$1.0k', '$750', '$500', '$250', '$0']);
        
        // Para pedidos max es 1. Labels: 1, 0.8, 0.5, 0.3, 0 (redondeado por fixed(0) en dashboard-actions)
        // Nota: maxOrders es Math.max(...monthlyOrderCount, 1) -> max es 1
        // stepwise: step = 1/4 = 0.25. [1, 0.75, 0.5, 0.25, 0] 
        // Formatter para pedidos: value.toFixed(0) -> ['1', '1', '1', '0', '0']
        expect(stats.ordersYLabels).toEqual(['1', '1', '1', '0', '0']);
    });
});
