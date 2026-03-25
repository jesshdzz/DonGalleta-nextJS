import { toast } from "sonner";

export const generarTicketPDF = (elementId: string, refId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    import("html2pdf.js").then((html2pdf) => {
        const opt = {
            margin: 0.3,
            filename: `Ticket-DonGalleta-${refId}.pdf`,
            image: { type: 'png' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'in', format: [3.15, 6.5] as [number, number], orientation: 'portrait' as const }
        };
        toast.success("Generando recibo...");
        html2pdf.default().set(opt).from(element).save();
    });
};
