import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  incrementarProgresoLealtad,
  generarCuponPorUmbral,
  obtenerCuponesLealtadDisponibles,
  descontarProgresoAlUsarCupon,
} from '../actions/loyalty-actions';
import { prisma } from '@/lib/prisma';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    coupon: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      fields: {
        usageLimit: 'usageLimit',
      },
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'test-user-id' },
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('HU-55: Puntos Galleta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('incrementarProgresoLealtad', () => {
    it('debería incrementar progreso correctamente (ratio 1:1)', async () => {
      const userId = 'user-123';
      const montoCompra = 25; // $25 = 25% de progreso

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        loyaltyProgress: 20, // Ya tiene 20%
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValue({
        id: userId,
        loyaltyProgress: 45, // 20 + 25 = 45
      } as any);

      const resultado = await incrementarProgresoLealtad(userId, montoCompra);

      expect(resultado.success).toBe(true);
      expect(resultado.progresoAnterior).toBe(20);
      expect(resultado.nuevoProgreso).toBe(45);
      expect(resultado.incremento).toBe(25);
      expect(resultado.umbralesAlcanzados).toEqual([]);
    });

    it('debería generar cupón al cruzar umbral de 50%', async () => {
      const userId = 'user-123';
      const montoCompra = 20; // $20

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        loyaltyProgress: 40, // 40% -> 60% (cruza 50%)
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValue({
        id: userId,
        loyaltyProgress: 60,
      } as any);

      vi.mocked(prisma.coupon.findFirst).mockResolvedValue(null); // No existe cupón previo

      vi.mocked(prisma.coupon.create).mockResolvedValue({
        id: 'coupon-1',
        code: 'LOYAL50-123ABC-TEST',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        isActive: true,
        usageLimit: 1,
        usedCount: 0,
        expirationDate: new Date('2027-01-01'),
      } as any);

      const resultado = await incrementarProgresoLealtad(userId, montoCompra);

      expect(resultado.success).toBe(true);
      expect(resultado.umbralesAlcanzados).toEqual([50]);
      expect(resultado.cuponesGenerados).toHaveLength(1);
      expect(resultado.cuponesGenerados![0].code).toContain('LOYAL50');
    });

    it('debería generar múltiples cupones al cruzar varios umbrales', async () => {
      const userId = 'user-123';
      const montoCompra = 60; // $60

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        loyaltyProgress: 30, // 30% -> 90% (cruza 50% y 75%)
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValue({
        id: userId,
        loyaltyProgress: 90,
      } as any);

      vi.mocked(prisma.coupon.findFirst).mockResolvedValue(null);

      vi.mocked(prisma.coupon.create)
        .mockResolvedValueOnce({
          id: 'coupon-1',
          code: 'LOYAL50-123ABC-TEST',
          discountType: 'PERCENTAGE',
          discountValue: 10,
        } as any)
        .mockResolvedValueOnce({
          id: 'coupon-2',
          code: 'LOYAL75-123ABC-TEST',
          discountType: 'PERCENTAGE',
          discountValue: 20,
        } as any);

      const resultado = await incrementarProgresoLealtad(userId, montoCompra);

      expect(resultado.success).toBe(true);
      expect(resultado.umbralesAlcanzados).toEqual([50, 75]);
      expect(resultado.cuponesGenerados).toHaveLength(2);
    });

    it('no debería generar cupón si ya existe uno activo', async () => {
      const userId = 'user-123';
      const montoCompra = 20;

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        loyaltyProgress: 40, // Cruza 50%
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValue({
        id: userId,
        loyaltyProgress: 60,
      } as any);

      // Ya existe un cupón activo sin usar
      vi.mocked(prisma.coupon.findFirst).mockResolvedValue({
        id: 'existing-coupon',
        code: 'LOYAL50-OLD',
        usedCount: 0,
        usageLimit: 1,
        isActive: true,
        expirationDate: new Date('2027-01-01'),
      } as any);

      const resultado = await incrementarProgresoLealtad(userId, montoCompra);

      expect(resultado.success).toBe(true);
      expect(resultado.umbralesAlcanzados).toEqual([50]);
      expect(resultado.cuponesGenerados).toHaveLength(1);
      expect(resultado.cuponesGenerados![0].code).toBe('LOYAL50-OLD');
      expect(prisma.coupon.create).not.toHaveBeenCalled();
    });
  });

  describe('generarCuponPorUmbral', () => {
    it('debería generar cupón de 10% para umbral 50', async () => {
      const userId = 'user-123';
      const umbral = 50;

      vi.mocked(prisma.coupon.findFirst).mockResolvedValue(null);

      vi.mocked(prisma.coupon.create).mockResolvedValue({
        id: 'new-coupon',
        code: 'LOYAL50-123ABC',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        isActive: true,
        usageLimit: 1,
        usedCount: 0,
      } as any);

      const resultado = await generarCuponPorUmbral(userId, umbral);

      expect(resultado.success).toBe(true);
      expect(resultado.coupon).toBeDefined();
      expect(resultado.coupon!.discountValue).toBe(10);
      expect(resultado.coupon!.code).toContain('LOYAL50');
    });

    it('debería generar cupón de 20% para umbral 75', async () => {
      const userId = 'user-123';
      const umbral = 75;

      vi.mocked(prisma.coupon.findFirst).mockResolvedValue(null);

      vi.mocked(prisma.coupon.create).mockResolvedValue({
        id: 'new-coupon',
        code: 'LOYAL75-123ABC',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        isActive: true,
        usageLimit: 1,
        usedCount: 0,
      } as any);

      const resultado = await generarCuponPorUmbral(userId, umbral);

      expect(resultado.success).toBe(true);
      expect(resultado.coupon!.discountValue).toBe(20);
    });

    it('debería generar cupón de 40% para umbral 100', async () => {
      const userId = 'user-123';
      const umbral = 100;

      vi.mocked(prisma.coupon.findFirst).mockResolvedValue(null);

      vi.mocked(prisma.coupon.create).mockResolvedValue({
        id: 'new-coupon',
        code: 'LOYAL100-123ABC',
        discountType: 'PERCENTAGE',
        discountValue: 40,
        isActive: true,
        usageLimit: 1,
        usedCount: 0,
      } as any);

      const resultado = await generarCuponPorUmbral(userId, umbral);

      expect(resultado.success).toBe(true);
      expect(resultado.coupon!.discountValue).toBe(40);
    });

    it('NO debería crear nuevo cupón si ya existe uno con usos disponibles', async () => {
      const userId = 'user-123';
      const umbral = 50;

      vi.mocked(prisma.coupon.findFirst).mockResolvedValue({
        id: 'existing-coupon',
        code: 'LOYAL50-OLD',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        usedCount: 0,
        usageLimit: 1,
        isActive: true,
      } as any);

      const resultado = await generarCuponPorUmbral(userId, umbral);

      expect(resultado.success).toBe(true);
      expect(resultado.mensaje).toBe('Cupón ya existe');
      expect(prisma.coupon.create).not.toHaveBeenCalled();
    });

    it('SÍ debería crear nuevo cupón si el existente está agotado', async () => {
      const userId = 'user-123';
      const umbral = 50;

      // Primer call: encuentra cupón agotado (usedCount >= usageLimit)
      vi.mocked(prisma.coupon.findFirst).mockResolvedValue(null);

      vi.mocked(prisma.coupon.create).mockResolvedValue({
        id: 'new-coupon',
        code: 'LOYAL50-NEW',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        usedCount: 0,
        usageLimit: 1,
        isActive: true,
      } as any);

      const resultado = await generarCuponPorUmbral(userId, umbral);

      expect(resultado.success).toBe(true);
      expect(prisma.coupon.create).toHaveBeenCalled();
    });
  });

  describe('obtenerCuponesLealtadDisponibles', () => {
    it('debería retornar todos cupones bloqueados si progreso < 50', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        loyaltyProgress: 30, // Solo 30%, no alcanza ningún umbral
      } as any);

      vi.mocked(prisma.coupon.findMany).mockResolvedValue([]);

      const resultado = await obtenerCuponesLealtadDisponibles();

      expect(resultado.success).toBe(true);
      expect(resultado.cupones!['10']).toBeNull();
      expect(resultado.cupones!['20']).toBeNull();
      expect(resultado.cupones!['40']).toBeNull();
      expect(resultado.progresoActual).toBe(30);
    });

    it('debería retornar solo cupón 10% si progreso entre 50-74', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        loyaltyProgress: 60, // Entre 50 y 75
      } as any);

      vi.mocked(prisma.coupon.findMany).mockResolvedValue([
        {
          id: 'coupon-1',
          code: 'LOYAL50-ABC',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          usedCount: 0,
          usageLimit: 1,
          isActive: true,
          expirationDate: new Date('2027-01-01'),
        } as any,
      ]);

      const resultado = await obtenerCuponesLealtadDisponibles();

      expect(resultado.success).toBe(true);
      expect(resultado.cupones!['10']).not.toBeNull();
      expect(resultado.cupones!['10']!.discountValue).toBe(10);
      expect(resultado.cupones!['20']).toBeNull(); // Bloqueado
      expect(resultado.cupones!['40']).toBeNull(); // Bloqueado
    });

    it('debería retornar cupones 10% y 20% si progreso entre 75-99', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        loyaltyProgress: 80, // Entre 75 y 100
      } as any);

      vi.mocked(prisma.coupon.findMany).mockResolvedValue([
        {
          id: 'coupon-1',
          code: 'LOYAL50-ABC',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          usedCount: 0,
          usageLimit: 1,
        } as any,
        {
          id: 'coupon-2',
          code: 'LOYAL75-ABC',
          discountType: 'PERCENTAGE',
          discountValue: 20,
          usedCount: 0,
          usageLimit: 1,
        } as any,
      ]);

      const resultado = await obtenerCuponesLealtadDisponibles();

      expect(resultado.success).toBe(true);
      expect(resultado.cupones!['10']).not.toBeNull();
      expect(resultado.cupones!['20']).not.toBeNull();
      expect(resultado.cupones!['40']).toBeNull(); // Aún bloqueado
    });

    it('debería retornar todos los cupones si progreso >= 100', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        loyaltyProgress: 100, // 100%, todos desbloqueados
      } as any);

      vi.mocked(prisma.coupon.findMany).mockResolvedValue([
        {
          id: 'coupon-1',
          code: 'LOYAL50-ABC',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          usedCount: 0,
          usageLimit: 1,
        } as any,
        {
          id: 'coupon-2',
          code: 'LOYAL75-ABC',
          discountType: 'PERCENTAGE',
          discountValue: 20,
          usedCount: 0,
          usageLimit: 1,
        } as any,
        {
          id: 'coupon-3',
          code: 'LOYAL100-ABC',
          discountType: 'PERCENTAGE',
          discountValue: 40,
          usedCount: 0,
          usageLimit: 1,
        } as any,
      ]);

      const resultado = await obtenerCuponesLealtadDisponibles();

      expect(resultado.success).toBe(true);
      expect(resultado.cupones!['10']).not.toBeNull();
      expect(resultado.cupones!['20']).not.toBeNull();
      expect(resultado.cupones!['40']).not.toBeNull();
    });

    it('NO debería retornar cupones ya usados (usedCount >= usageLimit)', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        loyaltyProgress: 100,
      } as any);

      // La query de Prisma filtra automáticamente cupones con usedCount >= usageLimit
      // Por lo tanto, findMany retorna array vacío
      vi.mocked(prisma.coupon.findMany).mockResolvedValue([]);

      const resultado = await obtenerCuponesLealtadDisponibles();

      expect(resultado.success).toBe(true);
      // Aunque progreso = 100, no hay cupones disponibles porque todos están usados
      expect(resultado.cupones!['10']).toBeNull();
      expect(resultado.cupones!['20']).toBeNull();
      expect(resultado.cupones!['40']).toBeNull();
    });
  });

  describe('descontarProgresoAlUsarCupon', () => {
    it('debería restar 50 puntos al usar cupón LOYAL50', async () => {
      const userId = 'user-123';
      const codigoCupon = 'LOYAL50-ABC-123';

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        loyaltyProgress: 80, // Tiene 80%
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValue({
        id: userId,
        loyaltyProgress: 30, // 80 - 50 = 30
      } as any);

      const resultado = await descontarProgresoAlUsarCupon(userId, codigoCupon);

      expect(resultado.success).toBe(true);
      expect(resultado.progresoAnterior).toBe(80);
      expect(resultado.nuevoProgreso).toBe(30);
      expect(resultado.porcentajeDescontado).toBe(50);
    });

    it('debería restar 75 puntos al usar cupón LOYAL75', async () => {
      const userId = 'user-123';
      const codigoCupon = 'LOYAL75-ABC-123';

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        loyaltyProgress: 100, // Tiene 100%
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValue({
        id: userId,
        loyaltyProgress: 25, // 100 - 75 = 25
      } as any);

      const resultado = await descontarProgresoAlUsarCupon(userId, codigoCupon);

      expect(resultado.success).toBe(true);
      expect(resultado.progresoAnterior).toBe(100);
      expect(resultado.nuevoProgreso).toBe(25);
      expect(resultado.porcentajeDescontado).toBe(75);
    });

    it('debería restar 100 puntos al usar cupón LOYAL100', async () => {
      const userId = 'user-123';
      const codigoCupon = 'LOYAL100-ABC-123';

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        loyaltyProgress: 100,
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValue({
        id: userId,
        loyaltyProgress: 0, // 100 - 100 = 0
      } as any);

      const resultado = await descontarProgresoAlUsarCupon(userId, codigoCupon);

      expect(resultado.success).toBe(true);
      expect(resultado.nuevoProgreso).toBe(0);
      expect(resultado.porcentajeDescontado).toBe(100);
    });

    it('no debería permitir progreso negativo', async () => {
      const userId = 'user-123';
      const codigoCupon = 'LOYAL75-ABC-123';

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        loyaltyProgress: 30, // Solo tiene 30%, pero intenta usar cupón de 75
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValue({
        id: userId,
        loyaltyProgress: 0, // Math.max(30 - 75, 0) = 0
      } as any);

      const resultado = await descontarProgresoAlUsarCupon(userId, codigoCupon);

      expect(resultado.success).toBe(true);
      expect(resultado.nuevoProgreso).toBe(0);
      expect(resultado.nuevoProgreso).toBeGreaterThanOrEqual(0);
    });

    it('no debería afectar si el cupón no es de lealtad', async () => {
      const userId = 'user-123';
      const codigoCupon = 'VERANO2024'; // Cupón normal

      const resultado = await descontarProgresoAlUsarCupon(userId, codigoCupon);

      expect(resultado.success).toBe(true);
      expect(resultado.mensaje).toBe('No es cupón de lealtad');
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('Escenarios de integración', () => {
    it('Escenario completo: usuario alcanza 100%, usa cupón 20%, y solo quedan cupones bloqueados', async () => {
      const userId = 'user-123';

      // 1. Usuario tiene 80% y hace compra de $20 → llega a 100%
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        loyaltyProgress: 80,
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValue({
        id: userId,
        loyaltyProgress: 100,
      } as any);

      vi.mocked(prisma.coupon.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.coupon.create).mockResolvedValue({
        id: 'coupon-40',
        code: 'LOYAL100-NEW',
        discountType: 'PERCENTAGE',
        discountValue: 40,
      } as any);

      const incremento = await incrementarProgresoLealtad(userId, 20);
      expect(incremento.nuevoProgreso).toBe(100);

      // 2. Usuario usa cupón de 20% (LOYAL75) → progreso baja a 25%
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        loyaltyProgress: 100,
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValue({
        id: userId,
        loyaltyProgress: 25,
      } as any);

      const descuento = await descontarProgresoAlUsarCupon(userId, 'LOYAL75-ABC');
      expect(descuento.nuevoProgreso).toBe(25);

      // 3. Al consultar cupones, todos deberían estar bloqueados
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        loyaltyProgress: 25, // Solo 25%, no alcanza ningún umbral
      } as any);

      vi.mocked(prisma.coupon.findMany).mockResolvedValue([]);

      const cupones = await obtenerCuponesLealtadDisponibles();
      expect(cupones.cupones!['10']).toBeNull();
      expect(cupones.cupones!['20']).toBeNull();
      expect(cupones.cupones!['40']).toBeNull();
    });
  });
});
