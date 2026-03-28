"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminBackButton() {
  const pathname = usePathname();
  
  if (pathname === "/admin") return null;

  return (
    <div className="mb-4">
      <Link href="/admin">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Volver al panel principal
        </Button>
      </Link>
    </div>
  );
}
