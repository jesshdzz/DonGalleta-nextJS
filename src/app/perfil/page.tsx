import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PerfilView from "./VistaPerfil";

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }
  return <PerfilView user={session.user} />;
}