import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserOrders } from "@/actions/orders-actions";
import { PedidosClient, Order } from "./PedidosClient";

export default async function MisPedidosPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const response = await getUserOrders();
  const initialOrders = (response.success && response.orders)
    ? (response.orders as Order[])
    : [];

  return <PedidosClient initialOrders={initialOrders} />;
}