import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  getUserFavorites,
  getUserFavoriteIds,
  isFavorite
} from '../actions/favorite-actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findFirst: vi.fn(),
    },
    favorite: {
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('HU-09: addToFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('HU-09: debería retornar error si el usuario no está autenticado', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const result = await addToFavorites(1);

    expect(result.error).toBe("Debes iniciar sesión para añadir favoritos");
    expect(prisma.product.findFirst).not.toHaveBeenCalled();
  });

  it('HU-09: debería retornar error si el producto no existe', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.product.findFirst).mockResolvedValueOnce(null);

    const result = await addToFavorites(1);

    expect(result.error).toBe("Producto no encontrado");
    expect(prisma.product.findFirst).toHaveBeenCalledWith({
      where: { 
        id: 1,
        isActive: true
      }
    });
  });

  it('HU-09: debería retornar error si el producto ya está en favoritos', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.product.findFirst).mockResolvedValueOnce({ id: 1, name: 'Test Product' } as any);
    vi.mocked(prisma.favorite.findUnique).mockResolvedValueOnce({ id: 1 } as any);

    const result = await addToFavorites(1);

    expect(result.error).toBe("El producto ya está en tus favoritos");
    expect(prisma.favorite.findUnique).toHaveBeenCalledWith({
      where: {
        userId_productId: {
          userId: 'user1',
          productId: 1
        }
      }
    });
  });

  it('HU-09: debería añadir el producto a favoritos exitosamente', async () => {
    const mockFavorite = { id: 1, userId: 'user1', productId: 1 };
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.product.findFirst).mockResolvedValueOnce({ id: 1, name: 'Test Product' } as any);
    vi.mocked(prisma.favorite.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.favorite.create).mockResolvedValueOnce(mockFavorite as any);

    const result = await addToFavorites(1);

    expect(result.success).toBe(true);
    expect(result.favorite).toEqual(mockFavorite);
    expect(prisma.favorite.create).toHaveBeenCalledWith({
      data: {
        userId: 'user1',
        productId: 1
      }
    });
    expect(revalidatePath).toHaveBeenCalledWith("/productos");
    expect(revalidatePath).toHaveBeenCalledWith("/favoritos");
    expect(revalidatePath).toHaveBeenCalledWith("/productos/1");
  });

  it('HU-09: debería manejar errores de base de datos', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.product.findFirst).mockRejectedValueOnce(new Error('Database error'));

    const result = await addToFavorites(1);

    expect(result.error).toBe("Error interno del servidor");
  });
});

describe('HU-09: removeFromFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('HU-09: debería retornar error si el usuario no está autenticado', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const result = await removeFromFavorites(1);

    expect(result.error).toBe("Debes iniciar sesión para gestionar favoritos");
    expect(prisma.favorite.deleteMany).not.toHaveBeenCalled();
  });

  it('HU-09: debería retornar error si el producto no estaba en favoritos', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.favorite.deleteMany).mockResolvedValueOnce({ count: 0 });

    const result = await removeFromFavorites(1);

    expect(result.error).toBe("El producto no estaba en favoritos");
  });

  it('HU-09: debería eliminar el producto de favoritos exitosamente', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.favorite.deleteMany).mockResolvedValueOnce({ count: 1 });

    const result = await removeFromFavorites(1);

    expect(result.success).toBe(true);
    expect(prisma.favorite.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: 'user1',
        productId: 1
      }
    });
    expect(revalidatePath).toHaveBeenCalledWith("/productos");
    expect(revalidatePath).toHaveBeenCalledWith("/favoritos");
    expect(revalidatePath).toHaveBeenCalledWith("/productos/1");
  });

  it('HU-09: debería manejar errores de base de datos', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.favorite.deleteMany).mockRejectedValueOnce(new Error('Database error'));

    const result = await removeFromFavorites(1);

    expect(result.error).toBe("Error interno del servidor");
  });
});

describe('HU-09: toggleFavorite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('HU-09: debería retornar error si el usuario no está autenticado', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const result = await toggleFavorite(1);

    expect(result.error).toBe("Debes iniciar sesión para gestionar favoritos");
  });

  it('HU-09: debería eliminar de favoritos si ya existe', async () => {
    // Mock para toggleFavorite - primera llamada a auth y findUnique
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.favorite.findUnique).mockResolvedValueOnce({ id: 1 } as any);
    
    // Mock para removeFromFavorites - segunda llamada a auth y deleteMany
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.favorite.deleteMany).mockResolvedValueOnce({ count: 1 });

    const result = await toggleFavorite(1);

    expect((result as any).success).toBe(true);
  });

  it('HU-09: debería añadir a favoritos si no existe', async () => {
    const mockFavorite = { id: 1, userId: 'user1', productId: 1 };
    
    // Mock para toggleFavorite - primera llamada a auth y findUnique
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.favorite.findUnique).mockResolvedValueOnce(null);
    
    // Mocks para addToFavorites - segunda llamada a auth, product.findFirst, favorite.findUnique, y favorite.create
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.product.findFirst).mockResolvedValueOnce({ id: 1, name: 'Test Product' } as any);
    vi.mocked(prisma.favorite.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.favorite.create).mockResolvedValueOnce(mockFavorite as any);

    const result = await toggleFavorite(1);

    expect((result as any).success).toBe(true);
    expect((result as any).favorite).toEqual(mockFavorite);
  });

  it('HU-09: debería manejar errores de base de datos', async () => {
    vi.mocked(auth).mockRejectedValueOnce(new Error('Database error'));

    const result = await toggleFavorite(1);

    expect(result.error).toBe("Error interno del servidor");
  });
});

describe('HU-09: getUserFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('HU-09: debería retornar error si el usuario no está autenticado', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const result = await getUserFavorites();

    expect(result.error).toBe("Debes iniciar sesión para ver favoritos");
    expect(prisma.favorite.findMany).not.toHaveBeenCalled();
  });

  it('HU-09: debería retornar los favoritos del usuario exitosamente', async () => {
    const mockFavorites = [
      { 
        id: 1, 
        product: { 
          id: 1, 
          name: 'Product 1',
          flavors: []
        }
      }
    ];
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.favorite.findMany).mockResolvedValueOnce(mockFavorites as any);

    const result = await getUserFavorites();

    expect(result.success).toBe(true);
    expect(result.favorites).toEqual(mockFavorites);
    expect(prisma.favorite.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user1'
      },
      include: {
        product: {
          include: {
            flavors: {
              include: {
                flavor: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  });

  it('HU-09: debería manejar errores de base de datos', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.favorite.findMany).mockRejectedValueOnce(new Error('Database error'));

    const result = await getUserFavorites();

    expect(result.error).toBe("Error interno del servidor");
  });
});

describe('HU-09: getUserFavoriteIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('HU-09: debería retornar array vacío si el usuario no está autenticado', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const result = await getUserFavoriteIds();

    expect(result.favoriteIds).toEqual([]);
    expect(prisma.favorite.findMany).not.toHaveBeenCalled();
  });

  it('HU-09: debería retornar los IDs de favoritos del usuario exitosamente', async () => {
    const mockFavorites = [
      { productId: 1 },
      { productId: 2 }
    ];
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.favorite.findMany).mockResolvedValueOnce(mockFavorites as any);

    const result = await getUserFavoriteIds();

    expect(result.favoriteIds).toEqual([1, 2]);
    expect(prisma.favorite.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user1'
      },
      select: {
        productId: true
      }
    });
  });

  it('HU-09: debería retornar array vacío en caso de error', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.favorite.findMany).mockRejectedValueOnce(new Error('Database error'));

    const result = await getUserFavoriteIds();

    expect(result.favoriteIds).toEqual([]);
  });
});

describe('HU-09: isFavorite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('HU-09: debería retornar false si el usuario no está autenticado', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const result = await isFavorite(1);

    expect(result.isFavorite).toBe(false);
    expect(prisma.favorite.findUnique).not.toHaveBeenCalled();
  });

  it('HU-09: debería retornar true si el producto está en favoritos', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.favorite.findUnique).mockResolvedValueOnce({ id: 1 } as any);

    const result = await isFavorite(1);

    expect(result.isFavorite).toBe(true);
    expect(prisma.favorite.findUnique).toHaveBeenCalledWith({
      where: {
        userId_productId: {
          userId: 'user1',
          productId: 1
        }
      }
    });
  });

  it('HU-09: debería retornar false si el producto no está en favoritos', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.favorite.findUnique).mockResolvedValueOnce(null);

    const result = await isFavorite(1);

    expect(result.isFavorite).toBe(false);
  });

  it('HU-09: debería retornar false en caso de error', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user1' } } as any);
    vi.mocked(prisma.favorite.findUnique).mockRejectedValueOnce(new Error('Database error'));

    const result = await isFavorite(1);

    expect(result.isFavorite).toBe(false);
  });
});