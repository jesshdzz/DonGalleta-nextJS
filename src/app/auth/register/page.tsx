import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Registro | Don Galleta",
  description: "Crea tu cuenta para gestionar tus pedidos.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#F9F5F0] px-4 py-12">
      <div className="w-full max-w-[450px] space-y-6">
        
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <Link href="/" className="cursor-pointer inline-block">
            <h1 className="font-serif text-5xl font-bold text-primary">
              Don Galleta
            </h1>
          </Link>
          <p className="text-muted-foreground text-lg font-medium">
            Únete a nuestra comunidad
          </p>
        </div>

        {/* Formulario */}
        <RegisterForm />
        
      </div>
    </div>
  );
}