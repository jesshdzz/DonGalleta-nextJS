import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sendContactMessage } from "@/actions/contact-actions";
import { redirect } from "next/navigation";

export default function ContactoPage() {
  async function action(formData: FormData) {
    'use server';
    const res = await sendContactMessage(formData);
    if (res?.success) {
      // Por ahora, redirigir a la página principal con un mensaje de éxito
      // Más adelante se puede implementar un sistema de notificaciones
      redirect('/?mensaje=enviado');
    }
  }

  return (
    <div className="container mx-auto py-10 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            Contacta con Don Galleta
          </CardTitle>
          <CardDescription className="text-lg">
            ¿Tienes alguna pregunta o sugerencia? Nos encantaría escucharte.
            Completa el formulario y nos pondremos en contacto contigo pronto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-6">
            {/* Campo Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre completo *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Tu nombre completo"
                required
                className="w-full"
              />
            </div>

            {/* Campo Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo electrónico *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                className="w-full"
              />
            </div>

            {/* Campo Mensaje */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Mensaje *
              </Label>
              <textarea
                id="message"
                name="message"
                placeholder="Escribe aquí tu consulta o mensaje..."
                required
                rows={5}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Información adicional */}
            <div className="bg-secondary/20 p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Horario de atención:</span> 
                Lunes a Viernes de 9:00 AM a 6:00 PM. 
                Responderemos tu consulta dentro de las próximas 24 horas.
              </p>
            </div>

            {/* Botón de envío */}
            <div className="pt-4">
              <Button type="submit" className="w-full text-lg py-6">
                Enviar Mensaje
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}