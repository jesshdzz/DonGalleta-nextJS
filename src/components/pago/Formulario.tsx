"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FormularioPagoProps {
  amount: number;
}

export function FormularioPago({ amount }: FormularioPagoProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Redirección a la página de éxito
        return_url: `${window.location.origin}/pago-exitoso`, 
      },
    });

    if (error) {
      toast.error(error.message || "Ocurrió un error al procesar el pago");
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      <PaymentElement />
      
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full text-lg font-bold h-14 shadow-md mt-4"
        size="lg"
      >
        {isLoading ? "Procesando pago..." : `Pagar $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}