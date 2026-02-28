import { auth } from "@/auth";
import { UnauthorizedView } from "@/components/auth/unauthorized-view";

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

    return <>{children}</>;
}
