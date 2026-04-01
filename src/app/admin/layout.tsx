import { auth } from "@/auth";
import { UnauthorizedView } from "@/components/auth/unauthorized-view";
import { AdminBackButton } from "@/components/admin/admin-back-button";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    const user = session?.user as { role?: string } | undefined;
    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
        return <UnauthorizedView />;
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <AdminBackButton />
            {children}
        </div>
    );
}

