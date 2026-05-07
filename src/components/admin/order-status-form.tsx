'use client';

import { updateOrderStatus } from "@/actions/orders-actions";
import { toast } from "sonner";

interface OrderStatusFormProps {
    id: string;
    status: string;
}

export const OrderStatusForm = ({ id, status }: OrderStatusFormProps) => {

    const handleUpdateOrderStatus = async (id: string, status: string) => {
        try {
            await updateOrderStatus(id, status);
            toast.success("Estado del pedido actualizado");
        } catch {
            toast.error("Error al actualizar el estado del pedido");
        }
    }
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">Estado del Pedido <span className="text-destructive">*</span></label>
            <select
                defaultValue={status}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onChange={(e) => handleUpdateOrderStatus(id, e.target.value)}
            >
                <option value="PENDING">Pendiente</option>
                <option value="PROCESSING">Procesando</option>
                <option value="COMPLETED">Completado</option>
                <option value="CANCELLED">Cancelado</option>
            </select>
        </div>
    );
}