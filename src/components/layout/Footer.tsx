import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-6">
            <div className="flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row md:py-0 px-4 md:px-6">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Creado por <span className="font-semibold">Grupo FLIJ</span>. El código fuente está disponible en{" "}
                        GitHub.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link href="/terminos" className="text-sm font-medium underline underline-offset-4 decoration-muted-foreground hover:text-primary">
                        Términos
                    </Link>
                    <Link href="/privacidad" className="text-sm font-medium underline underline-offset-4 decoration-muted-foreground hover:text-primary">
                        Privacidad
                    </Link>
                </div>
            </div>
        </footer>
    );
}
