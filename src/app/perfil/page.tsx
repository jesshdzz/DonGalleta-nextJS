import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PerfilView from "./VistaPerfil";

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });
  const isOAuthUser = !dbUser?.password;

  return <PerfilView user={session.user} isOAuthUser={isOAuthUser} />;
}