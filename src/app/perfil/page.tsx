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
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      password: true,
      phoneNumber: true,
    },
  });

  if (!dbUser) {
    redirect("/auth/login");
  }

  const isOAuthUser = !dbUser.password;

  return <PerfilView user={dbUser} isOAuthUser={isOAuthUser} />;
}