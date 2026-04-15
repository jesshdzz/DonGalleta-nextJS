"use client";

import { useState, useEffect, useTransition } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  subscribeToRestock, 
  unsubscribeFromRestock, 
  checkSubscription 
} from "@/actions/waiting-list-actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface WaitingListButtonProps {
  productId: number;
  initialStock: number;
}

export default function WaitingListButton({
  productId,
  initialStock
}: WaitingListButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const router = useRouter();

  // Verificar si el usuario está suscrito al cargar el componente
  useEffect(() => {
    if (session?.user && initialStock === 0) {
      checkSubscription(productId).then((result) => {
        setIsSubscribed(result.isSubscribed);
      });
    }
  }, [session, productId, initialStock]);

  // No mostrar el botón si hay stock disponible
  if (initialStock > 0) {
    return null;
  }

  const handleToggleSubscription = () => {
    if (!session?.user) {
      toast.error("Debes iniciar sesion para recibir notificaciones");
      router.push("/auth/login");
      return;
    }

    startTransition(async () => {
      try {
        const result = isSubscribed 
          ? await unsubscribeFromRestock(productId)
          : await subscribeToRestock(productId);
        
        if (result.success) {
          setIsSubscribed(!isSubscribed);
          toast.success(result.message);
        } else {
          toast.error(result.error || "Error al procesar la solicitud");
        }
      } catch (error) {
        toast.error("Error al actualizar tu suscripcion");
        console.error("Error:", error);
      }
    });
  };

  return (
    <Button
      variant={isSubscribed ? "outline" : "default"}
      size="lg"
      className="w-full sm:w-auto"
      onClick={handleToggleSubscription}
      disabled={isPending}
    >
      {isSubscribed ? (
        <>
          <BellOff className="mr-2 h-5 w-5" />
          Ya estas en lista de espera
        </>
      ) : (
        <>
          <Bell className="mr-2 h-5 w-5" />
          Avisarme al volver
        </>
      )}
    </Button>
  );
}
