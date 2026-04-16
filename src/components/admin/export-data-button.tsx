'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useState } from 'react';
import { FileText } from 'lucide-react';
import type { DashboardStats } from '@/actions/dashboard-actions';
import { generateXml, generateCsv, dataPointsToRows, downloadFile } from '@/utils/xml-generator';

type DataType = 'ingresos' | 'pedidos';
type FileFormat = 'csv' | 'xml';

export function ExportDataButton({ stats }: { stats: DashboardStats }) {
    const [open, setOpen] = useState(false);
    const [dataType, setDataType] = useState<DataType>('ingresos');
    const [fileFormat, setFileFormat] = useState<FileFormat>('csv');

    function handleExport() {
        try {
            const data = dataType === 'ingresos' ? stats.monthlySales : stats.monthlyOrders;
            const rows = dataPointsToRows(data);
            const year = new Date().getFullYear();
            const label = dataType === 'ingresos' ? 'ingresos' : 'pedidos';

            if (fileFormat === 'csv') {
                const content = generateCsv(rows);
                downloadFile(content, `${label}_${year}.csv`, 'text/csv;charset=utf-8');
            } else {
                const content = generateXml(label, rows);
                downloadFile(content, `${label}_${year}.xml`, 'application/xml;charset=utf-8');
            }

            toast.success(`Archivo ${fileFormat.toUpperCase()} de ${label} exportado correctamente.`);
            setOpen(false);
        } catch (error) {
            console.error('Error al exportar:', error);
            toast.error('Ocurrió un error al exportar los datos.');
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button className="gap-2 h-12 shadow-sm">
                    <FileText className="h-4 w-4" />
                    Exportar datos
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Exportar datos del panel
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-4 pt-2">
                            <p className="text-sm text-muted-foreground">
                                Selecciona qué información deseas exportar y en qué formato.
                            </p>
                            <div className='flex flex-row gap-8 justify-center'>
                                <div className='flex flex-col gap-2'>
                                    <span className="text-sm font-medium text-foreground">Datos</span>
                                    <RadioGroup
                                        value={dataType}
                                        onValueChange={(v) => setDataType(v as DataType)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value="ingresos" id="ingresos" />
                                            <Label htmlFor="ingresos">Ingresos</Label>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value="pedidos" id="pedidos" />
                                            <Label htmlFor="pedidos">Pedidos</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <span className="text-sm font-medium text-foreground">Formato</span>
                                    <RadioGroup
                                        value={fileFormat}
                                        onValueChange={(v) => setFileFormat(v as FileFormat)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value="csv" id="csv" />
                                            <Label htmlFor="csv">CSV</Label>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value="xml" id="xml" />
                                            <Label htmlFor="xml">XML</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => {
                        e.preventDefault();
                        handleExport();
                    }}>
                        Exportar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}