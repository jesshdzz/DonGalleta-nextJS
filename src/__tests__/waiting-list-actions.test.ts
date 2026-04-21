import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  subscribeToRestock,
  unsubscribeFromRestock,
  checkSubscription,
  getWaitingListByProduct,
  notifyWaitingList
} from '../actions/waiting-list-actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { sendRestockAlert } from '@/lib/email';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    waitingList: {
      upsert: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
  sendRestockAlert: vi.fn(),
}));

describe('HU-56: subscribeToRestock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deberia retornar error si el usuario no esta autenticado', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const result = await subscribeToRestock(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Debes iniciar sesión para recibir notificaciones");
    expect(prisma.product.findFirst).not.toHaveBeenCalled();
  });

  it('deberia retornar error si el producto no existe', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.product.findFirst).mockResolvedValueOnce(null);

    const result = await subscribeToRestock(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Producto no encontrado");
  });

  it('deberia retornar error si el producto tiene stock disponible', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.product.findFirst).mockResolvedValueOnce({ id: 1, stock: 10 } as any);

    const result = await subscribeToRestock(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Este producto tiene stock disponible");
  });

  it('deberia crear una suscripcion exitosamente cuando el producto esta agotado', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.product.findFirst).mockResolvedValueOnce({ id: 1, stock: 0 } as any);
    vi.mocked(prisma.waitingList.upsert).mockResolvedValueOnce({ id: 'wl1' } as any);

    const result = await subscribeToRestock(1);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Te avisaremos cuando el producto esté disponible");
    expect(prisma.waitingList.upsert).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/productos/1');
  });
});

describe('HU-56: unsubscribeFromRestock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deberia retornar error si el usuario no esta autenticado', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const result = await unsubscribeFromRestock(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Debes iniciar sesión");
  });

  it('deberia eliminar la suscripcion exitosamente', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.waitingList.delete).mockResolvedValueOnce({ id: 'wl1' } as any);

    const result = await unsubscribeFromRestock(1);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Ya no recibirás notificaciones de este producto");
    expect(prisma.waitingList.delete).toHaveBeenCalledWith({
      where: {
        userId_productId: {
          userId: 'user1',
          productId: 1
        }
      }
    });
  });
});

describe('HU-56: checkSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deberia retornar false si el usuario no esta autenticado', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const result = await checkSubscription(1);

    expect(result.isSubscribed).toBe(false);
  });

  it('deberia retornar true si el usuario esta suscrito', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.waitingList.findUnique).mockResolvedValueOnce({ id: 'wl1' } as any);

    const result = await checkSubscription(1);

    expect(result.isSubscribed).toBe(true);
  });

  it('deberia retornar false si el usuario no esta suscrito', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.waitingList.findUnique).mockResolvedValueOnce(null);

    const result = await checkSubscription(1);

    expect(result.isSubscribed).toBe(false);
  });
});

describe('HU-56: getWaitingListByProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deberia retornar error si el usuario no es admin', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1', role: 'USER' } } as any);

    const result = await getWaitingListByProduct(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe("No autorizado");
  });

  it('deberia retornar la lista de espera si el usuario es admin', async () => {
    const mockWaitingList = [
      { id: 'wl1', userId: 'user1', productId: 1, user: { id: 'user1', email: 'test@test.com', name: 'Test' } }
    ];
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'admin1', role: 'ADMIN' } } as any);
    vi.mocked(prisma.waitingList.findMany).mockResolvedValueOnce(mockWaitingList as any);

    const result = await getWaitingListByProduct(1);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockWaitingList);
  });
});

describe('HU-56: notifyWaitingList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no deberia hacer nada si el producto no tiene stock', async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValueOnce({ id: 1, stock: 0 } as any);

    await notifyWaitingList(1);

    expect(prisma.waitingList.findMany).not.toHaveBeenCalled();
    expect(sendRestockAlert).not.toHaveBeenCalled();
  });

  it('no deberia hacer nada si no hay suscriptores', async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValueOnce({ 
      id: 1, 
      stock: 10, 
      name: 'Test Product',
      price: 10.00 
    } as any);
    vi.mocked(prisma.waitingList.findMany).mockResolvedValueOnce([]);

    await notifyWaitingList(1);

    expect(sendRestockAlert).not.toHaveBeenCalled();
  });

  it('deberia enviar emails y eliminar suscripciones cuando hay stock y suscriptores', async () => {
    const mockProduct = { 
      id: 1, 
      stock: 10, 
      name: 'Test Product',
      price: { toString: () => '10.00' }
    };
    const mockSubscribers = [
      { 
        id: 'wl1', 
        userId: 'user1', 
        productId: 1, 
        user: { id: 'user1', email: 'test@test.com', name: 'Test User' } 
      }
    ];
    
    vi.mocked(prisma.product.findUnique).mockResolvedValueOnce(mockProduct as any);
    vi.mocked(prisma.waitingList.findMany).mockResolvedValueOnce(mockSubscribers as any);
    vi.mocked(sendRestockAlert).mockResolvedValueOnce({ success: true } as any);
    vi.mocked(prisma.waitingList.deleteMany).mockResolvedValueOnce({ count: 1 } as any);

    await notifyWaitingList(1);

    expect(sendRestockAlert).toHaveBeenCalledWith({
      userEmail: 'test@test.com',
      userName: 'Test User',
      productName: 'Test Product',
      productId: 1,
      currentStock: 10,
      price: '10.00'
    });
    expect(prisma.waitingList.deleteMany).toHaveBeenCalledWith({
      where: { productId: 1 }
    });
  });
});
