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

type MetricType = "ingresos" | "pedidos" | "visitas";

const chartData = {
    ingresos: {
        title: "Resumen de Ventas",
        description: "Visualización de ingresos de los últimos meses.",
        yLabels: ["$6000", "$4500", "$3000", "$1500", "$0"],
        data: [
            { label: "Ene", value: 30 }, { label: "Feb", value: 45 }, { label: "Mar", value: 60 },
            { label: "Abr", value: 80 }, { label: "May", value: 55 }, { label: "Jun", value: 70 },
            { label: "Jul", value: 90 }, { label: "Ago", value: 85 }, { label: "Sep", value: 65 },
            { label: "Oct", value: 75 }, { label: "Nov", value: 95 }, { label: "Dic", value: 100 },
        ],
        color: "bg-primary"
    },
    pedidos: {
        title: "Resumen de Pedidos",
        description: "Visualización de cantidad de pedidos de los últimos meses.",
        yLabels: ["500", "375", "250", "125", "0"],
        data: [
            { label: "Ene", value: 40 }, { label: "Feb", value: 50 }, { label: "Mar", value: 45 },
            { label: "Abr", value: 60 }, { label: "May", value: 75 }, { label: "Jun", value: 90 },
            { label: "Jul", value: 80 }, { label: "Ago", value: 85 }, { label: "Sep", value: 95 },
            { label: "Oct", value: 80 }, { label: "Nov", value: 100 }, { label: "Dic", value: 100 },
        ],
        color: "bg-blue-500"
    },
    visitas: {
        title: "Resumen de Visitas",
        description: "Visualización de visitas a la tienda de los últimos meses.",
        yLabels: ["5k", "3.7k", "2.5k", "1.2k", "0"],
        data: [
            { label: "Ene", value: 60 }, { label: "Feb", value: 55 }, { label: "Mar", value: 70 },
            { label: "Abr", value: 85 }, { label: "May", value: 80 }, { label: "Jun", value: 95 },
            { label: "Jul", value: 100 }, { label: "Ago", value: 90 }, { label: "Sep", value: 75 },
            { label: "Oct", value: 60 }, { label: "Nov", value: 80 }, { label: "Dic", value: 100 },
        ],
        color: "bg-purple-500"
    }
};

export default function AdminPage() {
    const [activeMetric, setActiveMetric] = useState<MetricType>("ingresos");
    const activeChart = chartData[activeMetric];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Panel de Control</h2>
            </div>

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
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">+20.1% con respecto al mes anterior</p>
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

                <Card
                    className={`cursor-pointer transition-all hover:bg-muted/50 ${activeMetric === "visitas" ? "ring-2 ring-purple-500 bg-muted/20" : ""}`}
                    onClick={() => setActiveMetric("visitas")}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visitas</CardTitle>
                        <Activity className={`h-4 w-4 ${activeMetric === "visitas" ? "text-purple-500" : "text-muted-foreground"}`} />
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
                        <CardTitle>{activeChart.title}</CardTitle>
                        <CardDescription>{activeChart.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-87.5 w-full mt-4 flex items-end justify-between px-2 gap-2 relative">
                            <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-muted-foreground">
                                {activeChart.yLabels.map((label, i) => (
                                    <span key={i}>{label}</span>
                                ))}
                            </div>
                            <div className="w-full flex items-end justify-around h-75 ml-12 border-b">
                                {activeChart.data.map((item, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 group w-full px-1">
                                        <div
                                            className={`w-full max-w-10 rounded-t-sm transition-all duration-300 ${activeChart.color} opacity-80 group-hover:opacity-100`}
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
        </div>
    );
}