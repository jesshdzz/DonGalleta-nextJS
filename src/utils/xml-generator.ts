import type { MonthlyDataPoint } from "@/actions/dashboard-actions";

type XmlRow = {
    mes: string;
    valor: number;
};

function escapeXml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export function generateXml(rootName: string, rows: XmlRow[]): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<${escapeXml(rootName)}>\n`;
    for (const row of rows) {
        xml += `  <registro>\n`;
        xml += `    <mes>${escapeXml(row.mes)}</mes>\n`;
        xml += `    <valor>${row.valor}</valor>\n`;
        xml += `  </registro>\n`;
    }
    xml += `</${escapeXml(rootName)}>\n`;
    return xml;
}

export function generateCsv(rows: XmlRow[]): string {
    const header = "Mes,Valor\n";
    const body = rows.map((r) => `${r.mes},${r.valor}`).join("\n");
    return header + body;
}

export function dataPointsToRows(data: MonthlyDataPoint[]): XmlRow[] {
    return data.map((d) => ({ mes: d.label, valor: d.rawValue }));
}

export function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}