"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveInvoiceData } from "@/actions/billing-actions";

interface InvoiceData {
    rfc: string;
    razonSocial: string;
    regimenFiscal: string;
    codigoPostal: string;
    usoCFDI: string;
}

interface EditInvoiceModalProps {
    userId: string;
    currentData?: InvoiceData | null;
}

export function EditInvoiceModal({ userId, currentData }: EditInvoiceModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState<InvoiceData>({
        rfc: currentData?.rfc || "",
        razonSocial: currentData?.razonSocial || "",
        regimenFiscal: currentData?.regimenFiscal || "",
        codigoPostal: currentData?.codigoPostal || "",
        usoCFDI: currentData?.usoCFDI || "G03",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            const result = await saveInvoiceData(userId, formData);
            if (result.success) {
                toast.success("Datos fiscales guardados", {
                    description: "Ya puedes solicitar facturas en tus pedidos.",
                });
                setIsOpen(false);
            } else {
                toast.error("Error", {
                    description: result.error || "No se pudo guardar la información.",
                });
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto border-[#58321D] text-[#58321D] hover:bg-[#F7DCBE]/30">
                    <FileText className="h-4 w-4" />
                    {currentData ? "Actualizar Datos Fiscales" : "Registrar Datos Fiscales"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle className="text-[#58321D]">Datos de Facturación</DialogTitle>
                    <DialogDescription>
                        Ingresa tu RFC y datos para poder emitir tus facturas.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="rfc" className="text-[#58321D] font-bold">RFC <span className="text-destructive">*</span></Label>
                        <Input id="rfc" value={formData.rfc} onChange={handleChange} required className="uppercase" placeholder="Ej. XAXX010101000" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="razonSocial" className="text-[#58321D] font-bold">Razón Social <span className="text-destructive">*</span></Label>
                        <Input id="razonSocial" value={formData.razonSocial} onChange={handleChange} required placeholder="Nombre de tu empresa o persona física" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="codigoPostal" className="text-[#58321D] font-bold">C.P. <span className="text-destructive">*</span></Label>
                            <Input id="codigoPostal" value={formData.codigoPostal} onChange={handleChange} required placeholder="Ej. 69000" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="usoCFDI" className="text-[#58321D] font-bold">Uso CFDI <span className="text-destructive">*</span></Label>
                            <Input id="usoCFDI" value={formData.usoCFDI} onChange={handleChange} required placeholder="Ej. G03" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="regimenFiscal" className="text-[#58321D] font-bold">Régimen Fiscal (Clave) <span className="text-destructive">*</span></Label>
                        <Input id="regimenFiscal" value={formData.regimenFiscal} onChange={handleChange} required placeholder="Ej. 601" />
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Guardar Datos
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}