import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function UnauthorizedView() {
    return (
        <div className="flex items-center justify-center min-h-[80vh] bg-background px-4">
            <Card className="w-full max-w-md shadow-lg border-destructive/20 text-center">
                <CardHeader className="space-y-4 flex flex-col items-center">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-2">
                        <ShieldAlert className="w-8 h-8 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-destructive">
                        Acceso Denegado
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-2">
                        No tienes los permisos necesarios para ver esta vista. Esta área es exclusiva para administradores.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-6">
                        Si crees que esto es un error, por favor contacta a soporte o al administrador del sistema.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center pb-8">
                    <Button asChild size="lg" className="w-full max-w-xs">
                        <Link href="/">
                            Volver al Inicio
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
