import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DesignPage() {
  return (
    <div className="container mx-auto py-10 space-y-12">

      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Sistema de Diseño Don Galleta</h1>
        <p className="text-muted-foreground text-lg">
          Verificación de paleta de colores, tipografía y componentes base.
        </p>
      </div>

      {/* SECCIÓN 1: PALETA DE COLORES RAW */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">1. Paleta Semántica</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {/* Primary */}
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md">
              Primary
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-bold">Uso:</span> Botones principales, headers activos.<br />
              <span className="font-mono">#58321D (Marrón)</span>
            </div>
          </div>

          {/* Secondary */}
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground font-bold shadow-md">
              Secondary
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-bold">Uso:</span> Fondos destacados, badges.<br />
              <span className="font-mono">#F7DCBE (Beige)</span>
            </div>
          </div>

          {/* Destructive */}
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-destructive flex items-center justify-center text-destructive-foreground font-bold shadow-md">
              Destructive
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-bold">Uso:</span> Errores, borrar, alertas.<br />
              <span className="font-mono">#A42D2C (Rojo)</span>
            </div>
          </div>

          {/* Muted */}
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold shadow-md">
              Muted
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-bold">Uso:</span> Elementos deshabilitados, fondos sutiles.<br />
              <span className="font-mono">#C69A8F (Rosado Tierra)</span>
            </div>
          </div>

          {/* Accent */}
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-accent flex items-center justify-center text-accent-foreground font-bold shadow-md">
              Accent
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-bold">Uso:</span> Hovers en dropdowns y tablas.<br />
              <span className="font-mono">#F7DCBE (Beige)</span>
            </div>
          </div>

          {/* Card */}
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-card border flex items-center justify-center text-card-foreground font-bold shadow-sm">
              Card
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-bold">Uso:</span> Fondo de tarjetas (Blanco).<br />
              <span className="font-mono">#FFFFFF</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: BOTONES */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">2. Botones e Interacciones</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="link">Link Button</Button>
        </div>
        <div className="flex gap-4 items-center mt-4">
          <Badge>Badge Default</Badge>
          <Badge variant="secondary">Badge Secondary</Badge>
          <Badge variant="destructive">Badge Destructive</Badge>
          <Badge variant="outline">Badge Outline</Badge>
        </div>
      </section>

      {/* SECCIÓN 3: TARJETAS Y FORMULARIOS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">3. Componentes UI (Cards & Inputs)</h2>
        <div className="grid md:grid-cols-2 gap-8">

          {/* Tarjeta de Ejemplo */}
          <Card>
            <CardHeader>
              <CardTitle>Galleta de Chispas</CardTitle>
              <CardDescription>La receta clásica de la abuela.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Este contenedor usa el color <code>bg-card</code> para resaltar sobre el fondo crema (<code>bg-background</code>).
              </p>
              <div className="mt-4 grid gap-2">
                <Label htmlFor="email">Suscribirse al boletín</Label>
                <Input type="email" id="email" placeholder="tu@email.com" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost">Cancelar</Button>
              <Button>Comprar</Button>
            </CardFooter>
          </Card>

          {/* Tabla de Ejemplo */}
          <div className="border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Pack 6 Galletas</TableCell>
                  <TableCell><Badge variant="secondary">Disponible</Badge></TableCell>
                  <TableCell className="text-right">$120.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Pastel de Zanahoria</TableCell>
                  <TableCell><Badge variant="destructive">Agotado</Badge></TableCell>
                  <TableCell className="text-right">$350.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
}