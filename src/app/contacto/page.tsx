"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sendContactMessage } from "@/actions/contact-actions";
import { contactSchema, ContactFormData } from "@/lib/validators/contact-schema";
import { Loader2 } from "lucide-react";

export default function ContactoPage() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("message", data.message);

      const result = await sendContactMessage(null, formData);

      if (result.success) {
        toast.success(result.message);
        reset();
      } else {
        toast.error(result.message);
        if (result.errors) {
          // Log errors for debugging if needed
          console.error(result.errors);
        }
      }
    });
  };

  return (
    <div className="container mx-auto py-10 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-lg border-primary/20">
        <CardHeader className="text-center bg-secondary/10 border-b border-primary/10 pb-8">
          <CardTitle className="text-4xl font-serif font-bold text-primary mb-2">
            Contacta con Don Galleta
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground/80">
            ¿Tienes alguna pregunta o sugerencia? Nos encantaría escucharte.
            Completa el formulario y nos pondremos en contacto contigo pronto.
          </CardDescription>
        </CardHeader>
        <CardContent className=" px-6 sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo Nombre */}
            <div className="space-y-2 mb-2">
              <Label htmlFor="name" className="text-base font-medium">Nombre completo *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Tu nombre completo"
                disabled={isPending}
                className={errors.name ? "border-destructive bg-destructive/5" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-0">{errors.name.message}</p>
              )}
            </div>

            {/* Campo Email */}
            <div className="space-y-2 mb-2">
              <Label htmlFor="email" className="text-base font-medium">Correo electrónico *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="tu@email.com"
                disabled={isPending}
                className={errors.email ? "border-destructive bg-destructive/5" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-0">{errors.email.message}</p>
              )}
            </div>

            {/* Campo Mensaje */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-base font-medium">Mensaje *</Label>
              <textarea
                id="message"
                {...register("message")}
                placeholder="Escribe aquí tu consulta o mensaje..."
                rows={5}
                disabled={isPending}
                className={`flex min-h-30 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.message ? "border-destructive bg-destructive/5" : "border-input"
                  }`}
              />
              {errors.message && (
                <p className="text-sm text-destructive mt-0">{errors.message.message}</p>
              )}
            </div>

            {/* Información adicional */}
            <div className="bg-secondary/20 p-4 rounded-lg border border-primary/5 flex gap-3 text-sm text-muted-foreground mb-1">
              <span className="text-xl">🕒</span>
              <p className="mt-0">
                <span className="font-semibold text-primary block mb-1">Horario de atención:</span>
                Lunes a Viernes de 9:00 AM a 6:00 PM. <br />
                Responderemos tu consulta dentro de las próximas 24 horas.
              </p>
            </div>

            {/* Botón de envío */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full text-lg h-12 shadow-md hover:shadow-lg transition-all font-bold"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Mensaje"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}