import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route"; // Importamos la función de tu amigo
import { prisma } from "@/lib/prisma"; // Importamos la instancia de prisma

// 1. MOCKEAMOS PRISMA: Esto evita que toquemos la base de datos real
vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findFirst: vi.fn(), // Convertimos findFirst en una función espía de Vitest
    },
  },
}));

describe("POST /api/pedidos/verificar", () => {
  
  // Limpiamos los espías antes de cada prueba para que no se mezclen los resultados
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // CASO 1: Falla porque no le mandamos el 'intent'
  it("debería retornar 400 si falta el intent en el body", async () => {
    const req = new Request("http://localhost:3000/api/pedidos/verificar", {
      method: "POST",
      body: JSON.stringify({}), // Body vacío, sin intent
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Falta ID");
    
    // Verificamos que Prisma NI SIQUIERA se haya llamado
    expect(prisma.order.findFirst).not.toHaveBeenCalled(); 
  });

  // CASO 2: Falla porque el intent no existe en la BD
  it("debería retornar 404 si la orden no se encuentra en la base de datos", async () => {
    // Simulamos que Prisma buscó y devolvió null (no encontró nada)
    vi.mocked(prisma.order.findFirst).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/pedidos/verificar", {
      method: "POST",
      body: JSON.stringify({ intent: "pi_invalido_123" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe("No encontrada");
    expect(prisma.order.findFirst).toHaveBeenCalledTimes(1); // Verificamos que sí consultó a la BD
  });

  // CASO 3: Éxito total
  it("debería retornar 200 y los datos de la orden si se encuentra exitosamente", async () => {
    // Armamos una orden falsa para que Prisma la "devuelva"
    const mockOrder = { 
      id: "orden_1", 
      total: 250.50,
      user: { name: "Yeyo" },
      items: [{ product: { name: "Galleta de Chocolate" } }] 
    };
    
    // Le decimos a Prisma que devuelva nuestra orden falsa
    vi.mocked(prisma.order.findFirst).mockResolvedValue(mockOrder as any);

    const req = new Request("http://localhost:3000/api/pedidos/verificar", {
      method: "POST",
      body: JSON.stringify({ intent: "pi_valido_999" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe("orden_1");
    expect(data.user.name).toBe("Yeyo");
  });

  // CASO 4: Falla catastrófica del servidor (Catch)
  it("debería retornar 500 si ocurre un error interno (ej. se cae la base de datos)", async () => {
    // Simulamos que la base de datos explotó y lanzó un error
    vi.mocked(prisma.order.findFirst).mockRejectedValue(new Error("Error de conexión a PostgreSQL"));

    const req = new Request("http://localhost:3000/api/pedidos/verificar", {
      method: "POST",
      body: JSON.stringify({ intent: "pi_valido_999" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Error interno");
  });

});