import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Activity, 
  ArrowRight, 
  DollarSign, 
  IceCream, 
  Package, 
  ShoppingCart, 
  Store, 
  Users 
} from "lucide-react";

export default function AdminPage() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Panel de Control</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% con respecto al mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180.1% con respecto al mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">+19 nuevos productos este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+19% con respecto al mes anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 max-md:col-span-2">
          <CardHeader>
            <CardTitle>Resumen de Ventas</CardTitle>
            <CardDescription>Visualización de ingresos de los últimos meses.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-87.5 w-full mt-4 flex items-end justify-between px-2 gap-2 relative">
              <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-muted-foreground">
                <span>$6000</span>
                <span>$4500</span>
                <span>$3000</span>
                <span>$1500</span>
                <span>$0</span>
              </div>
              <div className="w-full flex items-end justify-around h-75 ml-12 border-b">
                {[
                  { label: "Ene", value: 30 },
                  { label: "Feb", value: 45 },
                  { label: "Mar", value: 60 },
                  { label: "Abr", value: 80 },
                  { label: "May", value: 55 },
                  { label: "Jun", value: 70 },
                  { label: "Jul", value: 90 },
                  { label: "Ago", value: 85 },
                  { label: "Sep", value: 65 },
                  { label: "Oct", value: 75 },
                  { label: "Nov", value: 95 },
                  { label: "Dic", value: 100 },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group w-full px-1">
                    <div 
                      className="w-full max-w-10 rounded-t-sm transition-all duration-300 bg-primary/20 group-hover:bg-primary opacity-90"
                      style={{ height: `${item.value}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 max-md:col-span-2">
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
            <CardDescription>Gestiona las diferentes secciones de tu tienda.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Link href="/admin/pedidos" className="w-full">
                <Button variant="outline" className="w-full justify-start h-16 px-4">
                  <div className="p-2 bg-primary/10 rounded-md mr-4">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col items-start gap-1 flex-1">
                    <span className="font-medium text-base">Pedidos</span>
                    <span className="text-xs text-muted-foreground font-normal">Gestionar órdenes y envíos</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
                </Button>
              </Link>
              
              <Link href="/admin/productos" className="w-full">
                <Button variant="outline" className="w-full justify-start h-16 px-4">
                  <div className="p-2 bg-primary/10 rounded-md mr-4">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col items-start gap-1 flex-1">
                    <span className="font-medium text-base">Productos</span>
                    <span className="text-xs text-muted-foreground font-normal">Catálogo, precios y stock</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
                </Button>
              </Link>
              
              <Link href="/admin/sabores" className="w-full">
                <Button variant="outline" className="w-full justify-start h-16 px-4">
                  <div className="p-2 bg-primary/10 rounded-md mr-4">
                    <IceCream className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col items-start gap-1 flex-1">
                    <span className="font-medium text-base">Sabores</span>
                    <span className="text-xs text-muted-foreground font-normal">Variedades y opciones</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
                </Button>
              </Link>
              
              <Link href="/admin/tiendas" className="w-full">
                <Button variant="outline" className="w-full justify-start h-16 px-4">
                  <div className="p-2 bg-primary/10 rounded-md mr-4">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col items-start gap-1 flex-1">
                    <span className="font-medium text-base">Tiendas</span>
                    <span className="text-xs text-muted-foreground font-normal">Sucursales y ubicaciones</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
                </Button>
              </Link>

              <Link href="/admin/usuarios" className="w-full">
                <Button variant="outline" className="w-full justify-start h-16 px-4">
                  <div className="p-2 bg-primary/10 rounded-md mr-4">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col items-start gap-1 flex-1">
                    <span className="font-medium text-base">Usuarios</span>
                    <span className="text-xs text-muted-foreground font-normal">Clientes y administradores</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}