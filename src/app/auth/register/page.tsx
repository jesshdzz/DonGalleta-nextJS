import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/actions/auth-actions";
import { redirect } from "next/navigation";

export default function RegisterPage() {
  async function action(formData: FormData) {
    'use server';
    const res = await registerUser(formData);
    if (res?.success) {
      redirect('/auth/login');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center" >
      <form action={action} className="w-full max-w-sm space-y-4 p-8 border rounded-lg">
        <h1 className="text-2xl font-bold">Crear Cuenta (Temporal)</h1>
        <Input name="name" placeholder="Nombre" required />
        <Input name="email" placeholder="Email" type="email" required />
        <Input name="password" placeholder="Password" type="password" required />
        <Button type="submit" className="w-full">Registrarse</Button>
      </form>
    </div>
  );
}