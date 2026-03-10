import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "No tienes permiso para ver esto, inicia sesión primero." },
        { status: 401 }
      );
    }

    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

const misPedidos = await prisma.order.findMany({
      where: { 
        userId: usuario.id 
      },
      orderBy: {
        createdAt: 'desc' 
      },
      include: {
        items: {
          include: {
            product: true 
          }
        }
      }
    });

    return NextResponse.json(misPedidos);

  } catch (error) {
    console.error("Error al jalar los pedidos de la base de datos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}