'use server';

import { prisma } from "@/lib/prisma";

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export type MonthlyDataPoint = {
    label: string;
    value: number;
    rawValue: number;
};

export type DashboardStats = {
    totalRevenue: number;
    revenueChange: number;
    totalOrders: number;
    ordersChange: number;
    activeProducts: number;
    newProductsThisMonth: number;
    monthlySales: MonthlyDataPoint[];
    monthlyOrders: MonthlyDataPoint[];
    salesYLabels: string[];
    ordersYLabels: string[];
};

function formatCurrency(value: number): string {
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(0)}`;
}

function formatNumber(value: number): string {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}k`;
    }
    return `${value.toFixed(0)}`;
}

function generateYLabels(max: number, formatter: (v: number) => string): string[] {
    if (max === 0) max = 100;
    const step = max / 4;
    return [
        formatter(max),
        formatter(step * 3),
        formatter(step * 2),
        formatter(step),
        formatter(0),
    ];
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // Start of the current year
    const yearStart = new Date(currentYear, 0, 1);

    // Fetch all completed/non-cancelled orders for this year
    const ordersThisYear = await prisma.order.findMany({
        where: {
            createdAt: { gte: yearStart },
            status: { not: "CANCELLED" },
        },
        select: {
            total: true,
            createdAt: true,
        },
    });

    // Aggregate monthly revenue and order counts
    const monthlyRevenue = new Array(12).fill(0);
    const monthlyOrderCount = new Array(12).fill(0);

    for (const order of ordersThisYear) {
        const month = order.createdAt.getMonth();
        monthlyRevenue[month] += order.total.toNumber();
        monthlyOrderCount[month]++;
    }

    // Calculate totals
    const totalRevenue = monthlyRevenue.reduce((sum, v) => sum + v, 0);
    const totalOrders = monthlyOrderCount.reduce((sum, v) => sum + v, 0);

    // Calculate month-over-month change percentages
    const currentMonthRevenue = monthlyRevenue[currentMonth] || 0;
    const prevMonthRevenue = currentMonth > 0 ? monthlyRevenue[currentMonth - 1] : 0;
    const revenueChange = prevMonthRevenue > 0
        ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
        : 0;

    const currentMonthOrders = monthlyOrderCount[currentMonth] || 0;
    const prevMonthOrders = currentMonth > 0 ? monthlyOrderCount[currentMonth - 1] : 0;
    const ordersChange = prevMonthOrders > 0
        ? ((currentMonthOrders - prevMonthOrders) / prevMonthOrders) * 100
        : 0;

    // Max values for bar height normalization
    const maxRevenue = Math.max(...monthlyRevenue, 1);
    const maxOrders = Math.max(...monthlyOrderCount, 1);

    // Build chart data points (value is a 0-100 percentage for bar height)
    const monthlySales: MonthlyDataPoint[] = MONTH_LABELS.map((label, i) => ({
        label,
        value: Math.round((monthlyRevenue[i] / maxRevenue) * 100),
        rawValue: monthlyRevenue[i],
    }));

    const monthlyOrdersData: MonthlyDataPoint[] = MONTH_LABELS.map((label, i) => ({
        label,
        value: Math.round((monthlyOrderCount[i] / maxOrders) * 100),
        rawValue: monthlyOrderCount[i],
    }));

    // Active products count
    const activeProducts = await prisma.product.count({
        where: { isActive: true },
    });

    // Products created this month
    // Products don't have createdAt, so we count all active products as the "new" metric
    // We'll just show total active products
    const newProductsThisMonth = activeProducts;

    // Y-axis labels
    const salesYLabels = generateYLabels(maxRevenue, formatCurrency);
    const ordersYLabels = generateYLabels(maxOrders, formatNumber);

    return {
        totalRevenue,
        revenueChange,
        totalOrders,
        ordersChange,
        activeProducts,
        newProductsThisMonth,
        monthlySales,
        monthlyOrders: monthlyOrdersData,
        salesYLabels,
        ordersYLabels,
    };
}
