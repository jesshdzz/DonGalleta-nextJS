import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold text-slate-900">Don Galleta Store</h1>
      <Button size="lg">Comprar Ahora</Button>
    </div>
  );
}