"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function saveInvoiceData(userId: string, data: {
    rfc: string;
    razonSocial: string;
    regimenFiscal: string;
    codigoPostal: string;
    usoCFDI: string;
}) {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
        return { success: false, error: "No autorizado." };
    }

    try {
        await prisma.invoiceData.upsert({
            where: { userId },
            update: data,
            create: { ...data, userId },
        });

        revalidatePath("/perfil");
        return { success: true };
    } catch (error) {
        console.error("Error guardando datos de facturación:", error);
        return { success: false, error: "Error al guardar los datos fiscales." };
    }
}

export async function requestOrderInvoice(orderId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado." };
    }

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: { include: { invoiceData: true } } }
        });

        if (!order) return { success: false, error: "Orden no encontrada." };
        
        if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
            return { success: false, error: "No autorizado para solicitar factura de esta orden." };
        }

        if (!order.user?.invoiceData) {
            return { success: false, error: "Faltan datos fiscales. Regístralos en tu perfil primero." };
        }

        await prisma.order.update({
            where: { id: orderId },
            data: { invoiceRequested: true },
        });

        revalidatePath(`/pedidos`);
        return { success: true };
    } catch (error) {
        console.error("Error solicitando factura:", error);
        return { success: false, error: "Error al procesar la solicitud." };
    }
}