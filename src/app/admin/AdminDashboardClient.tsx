"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Activity,
    ArrowRight,
    DollarSign,
    Package,
    ShoppingCart,
} from "lucide-react";
import { adminPages } from "@/lib/admin-pages";
import type { DashboardStats, MonthlyDataPoint } from "@/actions/dashboard-actions";

type MetricType = "ingresos" | "pedidos" | "visitas";

const visitasPlaceholder = {
    title: "Resumen de Visitas",
    description: "Seguimiento de visitas (próximamente).",
    yLabels: ["—", "—", "—", "—", "—"],
    data: [
        { label: "Ene", value: 0, rawValue: 0 }, { label: "Feb", value: 0, rawValue: 0 }, { label: "Mar", value: 0, rawValue: 0 },
        { label: "Abr", value: 0, rawValue: 0 }, { label: "May", value: 0, rawValue: 0 }, { label: "Jun", value: 0, rawValue: 0 },
        { label: "Jul", value: 0, rawValue: 0 }, { label: "Ago", value: 0, rawValue: 0 }, { label: "Sep", value: 0, rawValue: 0 },
        { label: "Oct", value: 0, rawValue: 0 }, { label: "Nov", value: 0, rawValue: 0 }, { label: "Dic", value: 0, rawValue: 0 },
    ],
    color: "bg-purple-500"
};

function formatCurrency(value: number): string {
    return value.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 });
}

export function AdminDashboardClient({ stats }: { stats: DashboardStats }) {
    const [activeMetric, setActiveMetric] = useState<MetricType>("ingresos");

    const getActiveChart = () => {
        switch (activeMetric) {
            case "ingresos":
                return {
                    title: "Resumen de Ventas",
                    description: `Ingresos mensuales del ${new Date().getFullYear()}.`,
                    yLabels: stats.salesYLabels,
                    data: stats.monthlySales,
                    color: "bg-primary",
                };
            case "pedidos":
                return {
                    title: "Resumen de Pedidos",
                    description: `Cantidad de pedidos mensuales del ${new Date().getFullYear()}.`,
                    yLabels: stats.ordersYLabels,
                    data: stats.monthlyOrders,
                    color: "bg-blue-500",
                };
            case "visitas":
                return visitasPlaceholder;
        }
    };

    const activeChart = getActiveChart();

    const getTooltip = (item: MonthlyDataPoint): string => {
        if (activeMetric === "ingresos") return `${item.label}: ${formatCurrency(item.rawValue)}`;
        if (activeMetric === "pedidos") return `${item.label}: ${item.rawValue} pedidos`;
        return item.label;
    };

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card
                    className={`cursor-pointer transition-all hover:bg-muted/50 ${activeMetric === "ingresos" ? "ring-2 ring-primary bg-muted/20" : ""}`}
                    onClick={() => setActiveMetric("ingresos")}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                        <DollarSign className={`h-4 w-4 ${activeMetric === "ingresos" ? "text-primary" : "text-muted-foreground"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.revenueChange !== 0
                                ? `${stats.revenueChange > 0 ? "+" : ""}${stats.revenueChange.toFixed(1)}% vs mes anterior`
                                : "Sin cambios vs mes anterior"}
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all hover:bg-muted/50 ${activeMetric === "pedidos" ? "ring-2 ring-blue-500 bg-muted/20" : ""}`}
                    onClick={() => setActiveMetric("pedidos")}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                        <ShoppingCart className={`h-4 w-4 ${activeMetric === "pedidos" ? "text-blue-500" : "text-muted-foreground"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.ordersChange !== 0
                                ? `${stats.ordersChange > 0 ? "+" : ""}${stats.ordersChange.toFixed(1)}% vs mes anterior`
                                : "Sin cambios vs mes anterior"}
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all hover:bg-muted/50 ${activeMetric === "visitas" ? "ring-2 ring-purple-500 bg-muted/20" : ""}`}
                    onClick={() => setActiveMetric("visitas")}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visitas</CardTitle>
                        <Activity className={`h-4 w-4 ${activeMetric === "visitas" ? "text-purple-500" : "text-muted-foreground"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-muted-foreground">—</div>
                        <p className="text-xs text-muted-foreground">Próximamente</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeProducts}</div>
                        <p className="text-xs text-muted-foreground">Total de productos activos</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 max-md:col-span-2">
                    <CardHeader>
                        <CardTitle>{activeChart.title}</CardTitle>
                        <CardDescription>{activeChart.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {activeChart.data.every(d => d.rawValue === 0) && activeMetric !== "visitas" ? (
                            <div className="h-75 flex items-center justify-center text-muted-foreground text-sm">
                                No hay datos de {activeMetric} para este año aún.
                            </div>
                        ) : (
                            <div className="h-87.5 w-full mt-4 flex items-end justify-between px-2 gap-2 relative">
                                <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-muted-foreground">
                                    {activeChart.yLabels.map((label, i) => (
                                        <span key={i}>{label}</span>
                                    ))}
                                </div>
                                <div className="w-full flex items-end justify-around h-75 ml-12 border-b">
                                    {activeChart.data.map((item, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2 group w-full px-1 h-full">
                                            <div className="flex-1 w-full flex items-end justify-center relative">
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border text-popover-foreground text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none shadow-md z-10">
                                                    {getTooltip(item)}
                                                </div>
                                                <div
                                                    className={`w-full max-w-10 rounded-t-sm transition-all duration-300 ${activeChart.color} opacity-80 group-hover:opacity-100`}
                                                    style={{ height: `${item.value}%`, minHeight: item.rawValue > 0 ? "4px" : "0px" }}
                                                />
                                            </div>
                                            <span className="text-xs text-muted-foreground">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3 max-md:col-span-2">
                    <CardHeader>
                        <CardTitle>Accesos Rápidos</CardTitle>
                        <CardDescription>Gestiona las diferentes secciones de tu tienda.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            {adminPages.map((page) => (
                                <Link key={page.title} href={page.href} className="w-full">
                                    <Button variant="outline" className="w-full justify-start h-14 px-4">
                                        <div className="p-2 bg-primary/10 rounded-md mr-4 ring-1 ring-primary/20">
                                            <page.icon className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col items-start gap-0.5 flex-1">
                                            <span className="font-medium text-sm">{page.title}</span>
                                            <span className="text-xs text-muted-foreground font-normal">{page.description}</span>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
