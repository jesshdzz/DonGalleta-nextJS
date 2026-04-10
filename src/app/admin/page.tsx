import { getDashboardStats } from "@/actions/dashboard-actions";
import { AdminDashboardClient } from "./AdminDashboardClient";

export default async function AdminPage() {
    const stats = await getDashboardStats();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Panel de Control</h2>
            </div>

            <AdminDashboardClient stats={stats} />
        </div>
    );
}