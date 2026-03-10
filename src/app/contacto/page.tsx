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
    <div className="min-h-screen bg-background">
      {/* Container responsivo */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16">
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <Card className="w-full max-w-4xl lg:max-w-5xl shadow-xl border-primary/20 overflow-hidden">
            
            {/* Header responsivo */}
            <CardHeader className="text-center bg-secondary/10 border-b border-primary/10 px-4 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10">
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold text-primary mb-2 sm:mb-4 leading-tight">
                Contacta con Don Galleta
              </CardTitle>
              <CardDescription className="text-base sm:text-lg lg:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
                ¿Tienes alguna pregunta o sugerencia? Nos encantaría escucharte.
                Completa el formulario y nos pondremos en contacto contigo pronto.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-4 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg:space-y-8">
            
            {/* Grid de campos para pantallas grandes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              
              {/* Campo Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm sm:text-base font-medium block">
                  Nombre completo *
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Tu nombre completo"
                  disabled={isPending}
                  className={`h-11 sm:h-12 text-base ${errors.name ? "border-destructive bg-destructive/5" : ""}`}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base font-medium block">
                  Correo electrónico *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="tu@email.com"
                  disabled={isPending}
                  className={`h-11 sm:h-12 text-base ${errors.email ? "border-destructive bg-destructive/5" : ""}`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Campo Mensaje - Full width */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm sm:text-base font-medium block">
                Mensaje *
              </Label>
              <textarea
                id="message"
                {...register("message")}
                placeholder="Escribe aquí tu consulta o mensaje..."
                rows={6}
                disabled={isPending}
                className={`flex min-h-[120px] sm:min-h-[140px] lg:min-h-[160px] w-full rounded-md border bg-background px-3 py-3 text-sm sm:text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${errors.message ? "border-destructive bg-destructive/5" : "border-input"
                  }`}
              />
              {errors.message && (
                <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
              )}
            </div>

            {/* Información adicional - Responsive */}
            <div className="bg-secondary/20 p-4 sm:p-6 lg:p-8 rounded-lg border border-primary/5">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 text-sm sm:text-base text-muted-foreground">
                <span className="text-2xl sm:text-3xl flex-shrink-0">🕒</span>
                <div className="space-y-1">
                  <p className="font-semibold text-primary text-base sm:text-lg">
                    Horario de atención:
                  </p>
                  <p className="leading-relaxed">
                    Lunes a Viernes de 9:00 AM a 6:00 PM
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground/70">
                    Responderemos tu consulta dentro de las próximas 24 horas.
                  </p>
                </div>
              </div>
            </div>

            {/* Botón de envío - Responsive */}
            <div className="pt-2 sm:pt-4">
              <Button
                type="submit"
                className="w-full text-base sm:text-lg lg:text-xl h-12 sm:h-14 lg:h-16 shadow-md hover:shadow-lg transition-all duration-200 font-bold rounded-lg"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                    Enviando mensaje...
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
      </div>
    </div>
  );
}