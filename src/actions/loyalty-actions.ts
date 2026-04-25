"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Configuración de umbrales y recompensas
const UMBRALES = {
  50: { descuento: 10, codigo: "LOYAL50" },
  75: { descuento: 20, codigo: "LOYAL75" },
  100: { descuento: 40, codigo: "LOYAL100" },
} as const;

// Ratio de conversión: $1 MXN = 1% de progreso
const RATIO_PROGRESO = 1; // 1% por cada peso

/**
 * Convierte un cupón de Prisma a un objeto plano serializable
 */
function serializarCupon(cupon: any) {
  if (!cupon) return null;
  return {
    id: cupon.id,
    code: cupon.code,
    discountType: cupon.discountType,
    discountValue: Number(cupon.discountValue),
    expirationDate: cupon.expirationDate?.toISOString() || null,
    isActive: cupon.isActive,
    usageLimit: cupon.usageLimit,
    usedCount: cupon.usedCount,
    createdAt: cupon.createdAt?.toISOString() || null,
    userId: cupon.userId,
  };
}

/**
 * Incrementa el progreso de lealtad del usuario después de una compra
 * Genera cupones automáticamente al alcanzar umbrales
 */
export async function incrementarProgresoLealtad(
  userId: string,
  montoCompra: number
) {
  try {
    // Obtener progreso actual
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyProgress: true },
    });

    if (!usuario) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const progresoAnterior = usuario.loyaltyProgress || 0;
    const incremento = montoCompra * RATIO_PROGRESO;
    let nuevoProgreso = Math.min(progresoAnterior + incremento, 100);

    // Detectar qué umbrales se cruzaron
    const umbralesAlcanzados: (50 | 75 | 100)[] = [];
    for (const umbral of [50, 75, 100] as const) {
      if (progresoAnterior < umbral && nuevoProgreso >= umbral) {
        umbralesAlcanzados.push(umbral);
      }
    }

    // Actualizar progreso
    await prisma.user.update({
      where: { id: userId },
      data: { loyaltyProgress: nuevoProgreso },
    });

    // Generar cupones por umbrales alcanzados
    const cuponesGenerados = [];
    for (const umbral of umbralesAlcanzados) {
      const resultado = await generarCuponPorUmbral(userId, umbral);
      if (resultado.success && resultado.coupon) {
        cuponesGenerados.push(resultado.coupon);
      }
    }

    revalidatePath("/perfil");

    return {
      success: true,
      progresoAnterior,
      nuevoProgreso,
      incremento,
      umbralesAlcanzados,
      cuponesGenerados,
    };
  } catch (error) {
    console.error("Error incrementando progreso de lealtad:", error);
    return { success: false, error: "Error al actualizar progreso" };
  }
}

/**
 * Genera un cupón de descuento al alcanzar un umbral
 */
export async function generarCuponPorUmbral(userId: string, umbral: 50 | 75 | 100) {
  try {
    const config = UMBRALES[umbral];
    if (!config) {
      return { success: false, error: "Umbral inválido" };
    }

    // Verificar si ya existe un cupón activo Y DISPONIBLE para este usuario y umbral
    const cuponExistente = await prisma.coupon.findFirst({
      where: {
        userId,
        code: {
          startsWith: `${config.codigo}-`,
        },
        isActive: true,
        expirationDate: {
          gt: new Date(),
        },
        usedCount: {
          lt: prisma.coupon.fields.usageLimit, // Cupón aún tiene usos disponibles
        },
      },
    });

    if (cuponExistente) {
      return {
        success: true,
        mensaje: "Cupón ya existe",
        coupon: serializarCupon(cuponExistente),
      };
    }

    // Generar código único: LOYAL50-{userId}-{timestamp}
    const timestamp = Date.now().toString(36).toUpperCase();
    const userShort = userId.slice(-6).toUpperCase();
    const codigo = `${config.codigo}-${userShort}-${timestamp}`;

    // Crear cupón con expiración de 1 año
    const expiracion = new Date();
    expiracion.setFullYear(expiracion.getFullYear() + 1);

    const cupon = await prisma.coupon.create({
      data: {
        code: codigo,
        discountType: "PERCENTAGE",
        discountValue: config.descuento,
        expirationDate: expiracion,
        isActive: true,
        usageLimit: 1,
        usedCount: 0,
        userId,
      },
    });

    return {
      success: true,
      coupon: serializarCupon(cupon),
      mensaje: `Cupón de ${config.descuento}% generado`,
    };
  } catch (error) {
    console.error("Error generando cupón por umbral:", error);
    return { success: false, error: "Error al generar cupón" };
  }
}

/**
 * Obtiene el progreso actual de lealtad del usuario autenticado
 */
export async function obtenerProgresoLealtad() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autenticado" };
    }

    const usuario = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { loyaltyProgress: true },
    });

    if (!usuario) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const progreso = usuario.loyaltyProgress || 0;

    // Calcular cuánto falta para cada umbral
    const siguienteUmbral = progreso < 50 ? 50 : progreso < 75 ? 75 : progreso < 100 ? 100 : null;
    const faltan = siguienteUmbral ? siguienteUmbral - progreso : 0;

    return {
      success: true,
      progreso: Math.round(progreso * 100) / 100, // 2 decimales
      siguienteUmbral,
      faltan: Math.round(faltan * 100) / 100,
    };
  } catch (error) {
    console.error("Error obteniendo progreso de lealtad:", error);
    return { success: false, error: "Error al consultar progreso" };
  }
}

/**
 * Obtiene los cupones de lealtad disponibles del usuario
 * Solo muestra cupones si el usuario alcanza el umbral requerido
 */
export async function obtenerCuponesLealtadDisponibles() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autenticado" };
    }

    // Obtener progreso actual del usuario
    const usuario = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { loyaltyProgress: true },
    });

    const progresoActual = usuario?.loyaltyProgress || 0;

    const cupones = await prisma.coupon.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        expirationDate: {
          gt: new Date(),
        },
        OR: [
          { usageLimit: null },
          {
            usedCount: {
              lt: prisma.coupon.fields.usageLimit,
            },
          },
        ],
      },
      orderBy: {
        discountValue: "asc",
      },
    });

    // Solo mostrar cupones si el usuario alcanza el umbral requerido
    const cuponesDisponibles = {
      "10": progresoActual >= 50 
        ? serializarCupon(cupones.find((c) => c.code.startsWith("LOYAL50-")))
        : null,
      "20": progresoActual >= 75
        ? serializarCupon(cupones.find((c) => c.code.startsWith("LOYAL75-")))
        : null,
      "40": progresoActual >= 100
        ? serializarCupon(cupones.find((c) => c.code.startsWith("LOYAL100-")))
        : null,
    };

    return {
      success: true,
      cupones: cuponesDisponibles,
      progresoActual: Math.round(progresoActual * 100) / 100,
      total: cupones.length,
    };
  } catch (error) {
    console.error("Error obteniendo cupones de lealtad:", error);
    return { success: false, error: "Error al consultar cupones" };
  }
}

/**
 * Descuenta el progreso de la barra al usar un cupón
 */
export async function descontarProgresoAlUsarCupon(
  userId: string,
  codigoCupon: string
) {
  try {
    // Identificar el umbral del cupón usado
    let umbralUsado: number | null = null;
    if (codigoCupon.startsWith("LOYAL50-")) umbralUsado = 50;
    else if (codigoCupon.startsWith("LOYAL75-")) umbralUsado = 75;
    else if (codigoCupon.startsWith("LOYAL100-")) umbralUsado = 100;

    if (!umbralUsado) {
      // No es un cupón de lealtad, no afecta la barra
      return { success: true, mensaje: "No es cupón de lealtad" };
    }

    // Obtener progreso actual
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyProgress: true },
    });

    if (!usuario) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const progresoActual = usuario.loyaltyProgress || 0;
    const nuevoProgreso = Math.max(progresoActual - umbralUsado, 0);

    // Actualizar progreso
    await prisma.user.update({
      where: { id: userId },
      data: { loyaltyProgress: nuevoProgreso },
    });

    revalidatePath("/perfil");
    revalidatePath("/pago");

    return {
      success: true,
      progresoAnterior: progresoActual,
      nuevoProgreso,
      umbralDescontado: umbralUsado,
      porcentajeDescontado: umbralUsado, // Alias para tests
    };
  } catch (error) {
    console.error("Error descontando progreso:", error);
    return { success: false, error: "Error al descontar progreso" };
  }
}
