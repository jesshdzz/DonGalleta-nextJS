import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login | Don Galleta",
  description: "Inicia sesión para gestionar tus pedidos.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#F9F5F0] px-4 py-12">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="cursor-pointer inline-block">
            <h1 className="font-serif text-5xl font-bold text-primary">
              Don Galleta
            </h1>
          </Link>
          <p className="text-muted-foreground text-lg font-medium">
            El sabor de la tradición
          </p>
        </div>

        <LoginForm />
        
      </div>
    </div>
  );
}