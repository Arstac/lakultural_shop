"use client";

import { useState, useEffect, useMemo } from "react";
import { getDashboardData, DashboardData } from "@/app/actions/dashboard";
import { useTranslations } from "next-intl";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/SharedComponents";
import {
    Loader2,
    DollarSign,
    ShoppingCart,
    Ticket,
    Shirt,
    Music,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    BarChart,
    Bar,
    LineChart,
    Line,
    RadialBarChart,
    RadialBar,
} from "recharts";

const ACCENT = "#CCFF00";
const CARD_BG = "#111111";
const BORDER = "#222222";
const TEXT_MUTED = "#888888";
const CHART_COLORS = ["#CCFF00", "#00FFAA", "#FF6B6B", "#6B8AFF", "#FFB86B", "#FF79C6", "#8BE9FD"];

type ActiveView = "overview" | "orders" | "tickets" | "merch" | "music";

// ─── TOOLTIP ──────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg p-3 font-mono text-xs shadow-xl" style={{ backgroundColor: "#1a1a1a", border: `1px solid ${BORDER}`, color: "#fff" }}>
            <p className="font-bold mb-1.5 text-[11px]" style={{ color: ACCENT }}>{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
                    <span style={{ color: TEXT_MUTED }}>{p.name}:</span>
                    <span className="font-bold" style={{ color: "#fff" }}>
                        {typeof p.value === "number" ? (p.name?.toLowerCase().includes("€") || p.name?.toLowerCase().includes("revenue") || p.name?.toLowerCase().includes("ingreso") ? `${p.value.toFixed(2)}€` : p.value) : p.value}
                    </span>
                </p>
            ))}
        </div>
    );
}

// ─── HELPERS ──────────────────────────────────────────────────
function revenueByMonth(orders: DashboardData["orders"]) {
    const map: Record<string, { revenue: number; orders: number; tickets: number; merch: number; music: number }> = {};
    for (const o of orders) {
        if (!o.createdAt) continue;
        if (o.status !== "paid" && o.status !== "shipped") continue;
        const d = new Date(o.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!map[key]) map[key] = { revenue: 0, orders: 0, tickets: 0, merch: 0, music: 0 };
        map[key].revenue += o.amount || 0;
        map[key].orders++;
        for (const item of o.items || []) {
            const qty = item.quantity || 1;
            if (item.type === "event") map[key].tickets += qty;
            else if (item.type === "merch") map[key].merch += qty;
            else map[key].music += qty;
        }
    }
    return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, d]) => ({ month, ...d, revenue: Math.round(d.revenue * 100) / 100 }));
}

function ordersByStatus(orders: DashboardData["orders"]) {
    const counts: Record<string, number> = { paid: 0, pending: 0, shipped: 0, cancelled: 0 };
    for (const o of orders) counts[o.status || "pending"]++;
    return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
}

function categoryBreakdown(orders: DashboardData["orders"]) {
    const cats: Record<string, number> = { Eventos: 0, Merch: 0, Música: 0 };
    for (const o of orders) {
        if (o.status !== "paid" && o.status !== "shipped") continue;
        for (const item of o.items || []) {
            const rev = (item.price || 0) * (item.quantity || 1);
            if (item.type === "event") cats.Eventos += rev;
            else if (item.type === "merch") cats.Merch += rev;
            else cats.Música += rev;
        }
    }
    return Object.entries(cats).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 })).filter(c => c.value > 0);
}

function ticketsByEvent(tickets: DashboardData["tickets"]) {
    const map: Record<string, { active: number; used: number; cancelled: number }> = {};
    for (const t of tickets) {
        const ev = t.eventTitle || "—";
        if (!map[ev]) map[ev] = { active: 0, used: 0, cancelled: 0 };
        if (t.status === "active") map[ev].active++;
        else if (t.status === "used") map[ev].used++;
        else if (t.status === "cancelled") map[ev].cancelled++;
    }
    return Object.entries(map).map(([event, c]) => ({ event, ...c, total: c.active + c.used + c.cancelled }));
}

function ticketStatusPie(tickets: DashboardData["tickets"]) {
    const c = { active: 0, used: 0, cancelled: 0 };
    for (const t of tickets) {
        if (t.status === "active") c.active++;
        else if (t.status === "used") c.used++;
        else if (t.status === "cancelled") c.cancelled++;
    }
    return [
        { name: "Activas", value: c.active },
        { name: "Usadas", value: c.used },
        { name: "Canceladas", value: c.cancelled },
    ].filter(d => d.value > 0);
}

function merchByProduct(orders: DashboardData["orders"]) {
    const map: Record<string, { sold: number; revenue: number }> = {};
    for (const o of orders) {
        if (o.status !== "paid" && o.status !== "shipped") continue;
        for (const item of o.items || []) {
            if (item.type !== "merch") continue;
            const name = (item.name || "Unknown").substring(0, 22);
            if (!map[name]) map[name] = { sold: 0, revenue: 0 };
            map[name].sold += item.quantity || 1;
            map[name].revenue += (item.price || 0) * (item.quantity || 1);
        }
    }
    return Object.entries(map).map(([name, d]) => ({ name, ...d, revenue: Math.round(d.revenue * 100) / 100 })).sort((a, b) => b.sold - a.sold);
}

function stockByProduct(merch: DashboardData["merch"]) {
    return merch.map(m => ({
        name: m.title.substring(0, 22),
        stock: m.stock ?? 0,
        fill: (m.stock ?? 0) <= 5 ? "#FF6B6B" : (m.stock ?? 0) <= 15 ? "#FFB86B" : ACCENT,
    }));
}

function musicByAlbum(orders: DashboardData["orders"]) {
    const map: Record<string, { vinyl: number; digital: number; revenue: number }> = {};
    for (const o of orders) {
        if (o.status !== "paid" && o.status !== "shipped") continue;
        for (const item of o.items || []) {
            if (item.type === "event" || item.type === "merch") continue;
            const name = (item.name || "Unknown").substring(0, 22);
            if (!map[name]) map[name] = { vinyl: 0, digital: 0, revenue: 0 };
            const qty = item.quantity || 1;
            if (item.type === "album_physical") map[name].vinyl += qty;
            else map[name].digital += qty;
            map[name].revenue += (item.price || 0) * qty;
        }
    }
    return Object.entries(map).map(([name, d]) => ({ name, ...d, total: d.vinyl + d.digital, revenue: Math.round(d.revenue * 100) / 100 })).sort((a, b) => b.total - a.total);
}

function musicFormatPie(orders: DashboardData["orders"]) {
    let vinyl = 0, digital = 0;
    for (const o of orders) {
        if (o.status !== "paid" && o.status !== "shipped") continue;
        for (const item of o.items || []) {
            if (item.type === "event" || item.type === "merch") continue;
            const qty = item.quantity || 1;
            if (item.type === "album_physical") vinyl += qty;
            else digital += qty;
        }
    }
    return [
        { name: "Vinilo", value: vinyl },
        { name: "Digital", value: digital },
    ].filter(d => d.value > 0);
}

const STATUS_COLORS: Record<string, string> = {
    paid: ACCENT, pending: "#FFB86B", shipped: "#00FFAA", cancelled: "#FF6B6B",
    Activas: ACCENT, Usadas: "#00FFAA", Canceladas: "#FF6B6B",
    Vinilo: ACCENT, Digital: "#6B8AFF",
    Eventos: ACCENT, Merch: "#00FFAA", Música: "#6B8AFF",
};

// ─── CHART WRAPPER ────────────────────────────────────────────
function ChartCard({ title, children, span = 1 }: { title: string; children: React.ReactNode; span?: number }) {
    return (
        <div
            className={`rounded-xl p-6 ${span === 2 ? "lg:col-span-2" : ""}`}
            style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}
        >
            <h3 className="font-mono font-bold text-[11px] uppercase tracking-[0.15em] mb-5" style={{ color: TEXT_MUTED }}>{title}</h3>
            {children}
        </div>
    );
}

function NoData() {
    return <div className="h-[260px] flex items-center justify-center font-mono text-sm" style={{ color: TEXT_MUTED }}>Sin datos disponibles</div>;
}

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════
export default function AdminDashboardPage() {
    const t = useTranslations("Admin");
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<ActiveView>("overview");

    const fetchData = async () => {
        setLoading(true);
        try { setData(await getDashboardData()); } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    // Pre-compute all chart data
    const monthly = useMemo(() => (data ? revenueByMonth(data.orders) : []), [data]);
    const statusPie = useMemo(() => (data ? ordersByStatus(data.orders) : []), [data]);
    const catPie = useMemo(() => (data ? categoryBreakdown(data.orders) : []), [data]);
    const tByEvent = useMemo(() => (data ? ticketsByEvent(data.tickets) : []), [data]);
    const tStatusPie = useMemo(() => (data ? ticketStatusPie(data.tickets) : []), [data]);
    const mByProduct = useMemo(() => (data ? merchByProduct(data.orders) : []), [data]);
    const stockData = useMemo(() => (data ? stockByProduct(data.merch) : []), [data]);
    const muByAlbum = useMemo(() => (data ? musicByAlbum(data.orders) : []), [data]);
    const muFormatPie = useMemo(() => (data ? musicFormatPie(data.orders) : []), [data]);

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: ACCENT }} />
            </div>
        );
    }
    if (!data) return null;
    const { summary } = data;

    // KPI config
    const kpis: { key: ActiveView; label: string; value: string | number; icon: any; delta?: string }[] = [
        { key: "overview", label: t("totalRevenue"), value: `${summary.totalRevenue.toFixed(2)}€`, icon: DollarSign },
        { key: "orders", label: t("totalOrders"), value: summary.totalOrders, icon: ShoppingCart },
        { key: "tickets", label: t("ticketsSold"), value: summary.ticketsSold, icon: Ticket },
        { key: "merch", label: t("merchSold"), value: summary.merchSold, icon: Shirt },
        { key: "music", label: t("musicSold"), value: summary.musicSold, icon: Music },
    ];

    return (
        <>
            <AdminHeader
                title={t("dashboard")}
                subtitle={t("realTimeData")}
                onRefresh={fetchData}
                refreshLabel={t("refresh")}
                isRefreshing={loading}
            />

            <div className="px-6 py-8 space-y-8">
                {/* ── KPI BUTTONS ── */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {kpis.map(({ key, label, value, icon: Icon }) => {
                        const isActive = activeView === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveView(key)}
                                className="relative overflow-hidden rounded-xl p-5 text-left transition-all duration-300 hover:scale-[1.02] group"
                                style={{
                                    backgroundColor: isActive ? `${ACCENT}08` : CARD_BG,
                                    border: `1.5px solid ${isActive ? ACCENT : BORDER}`,
                                    boxShadow: isActive ? `0 0 20px ${ACCENT}15` : "none",
                                }}
                            >
                                {/* Active indicator dot */}
                                {isActive && (
                                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: ACCENT }} />
                                )}

                                <div className="flex items-center justify-between mb-3">
                                    <div
                                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                                        style={{ backgroundColor: isActive ? `${ACCENT}25` : `${BORDER}` }}
                                    >
                                        <Icon className="w-4 h-4" style={{ color: isActive ? ACCENT : TEXT_MUTED }} />
                                    </div>
                                    <ArrowUpRight
                                        className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ color: ACCENT }}
                                    />
                                </div>

                                <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: TEXT_MUTED }}>
                                    {label}
                                </p>
                                <p className="text-xl font-bold font-mono" style={{ color: isActive ? ACCENT : "#FFFFFF" }}>
                                    {value}
                                </p>

                                {/* Bottom accent line */}
                                <div
                                    className="absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-300"
                                    style={{ backgroundColor: ACCENT, opacity: isActive ? 1 : 0 }}
                                />
                            </button>
                        );
                    })}
                </div>

                {/* ── ACTIVE VIEW LABEL ── */}
                <div className="flex items-center gap-3">
                    <div className="w-1 h-5 rounded-full" style={{ backgroundColor: ACCENT }} />
                    <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: TEXT_MUTED }}>
                        {activeView === "overview" && "Resumen General"}
                        {activeView === "orders" && t("nav_orders")}
                        {activeView === "tickets" && t("nav_tickets")}
                        {activeView === "merch" && t("nav_merch")}
                        {activeView === "music" && t("nav_music")}
                    </p>
                </div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* OVERVIEW VIEW */}
                {/* ═══════════════════════════════════════════════════ */}
                {activeView === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Over Time */}
                        <ChartCard title={t("revenueOverTime")}>
                            {monthly.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <AreaChart data={monthly}>
                                        <defs>
                                            <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                                                <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                                        <XAxis dataKey="month" tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} />
                                        <YAxis tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} tickFormatter={v => `${v}€`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="revenue" name={t("revenue")} stroke={ACCENT} strokeWidth={2} fill="url(#gRevenue)" dot={{ fill: ACCENT, r: 3 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : <NoData />}
                        </ChartCard>

                        {/* Sales by Category */}
                        <ChartCard title={t("salesByCategory")}>
                            {catPie.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={catPie} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={5} dataKey="value"
                                            label={(p: any) => `${p.name} ${((p.percent ?? 0) * 100).toFixed(0)}%`}
                                            labelLine={{ stroke: TEXT_MUTED }}
                                        >
                                            {catPie.map((d, i) => <Cell key={i} fill={STATUS_COLORS[d.name] || CHART_COLORS[i]} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <NoData />}
                        </ChartCard>

                        {/* Avg Order Value */}
                        <ChartCard title={t("avgOrderValue")} span={2}>
                            {monthly.length > 0 ? (
                                <div className="flex items-center gap-8">
                                    <div className="flex-shrink-0 text-center">
                                        <p className="text-4xl font-bold font-mono" style={{ color: ACCENT }}>{summary.averageOrderValue.toFixed(2)}€</p>
                                        <p className="text-[10px] font-mono uppercase tracking-widest mt-1" style={{ color: TEXT_MUTED }}>promedio global</p>
                                    </div>
                                    <div className="flex-1 h-[120px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={monthly}>
                                                <XAxis dataKey="month" tick={{ fill: TEXT_MUTED, fontSize: 9, fontFamily: "monospace" }} stroke={BORDER} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line type="monotone" dataKey="revenue" name="Revenue" stroke={ACCENT} strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            ) : <NoData />}
                        </ChartCard>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════ */}
                {/* ORDERS VIEW */}
                {/* ═══════════════════════════════════════════════════ */}
                {activeView === "orders" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Orders over time */}
                            <ChartCard title="Pedidos por Mes">
                                {monthly.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={monthly}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                                            <XAxis dataKey="month" tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} />
                                            <YAxis tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="orders" name="Pedidos" fill={ACCENT} radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : <NoData />}
                            </ChartCard>

                            {/* Orders by Status */}
                            <ChartCard title="Estado de Pedidos">
                                {statusPie.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <PieChart>
                                            <Pie data={statusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={5} dataKey="value"
                                                label={(p: any) => `${p.name} (${p.value})`}
                                                labelLine={{ stroke: TEXT_MUTED }}
                                            >
                                                {statusPie.map((d, i) => <Cell key={i} fill={STATUS_COLORS[d.name] || CHART_COLORS[i]} />)}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : <NoData />}
                            </ChartCard>

                            {/* Revenue by category stacked */}
                            <ChartCard title="Ingresos por Categoría (mensual)" span={2}>
                                {monthly.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <AreaChart data={monthly}>
                                            <defs>
                                                <linearGradient id="gTickets" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={ACCENT} stopOpacity={0.3} /><stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="gMerch" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#00FFAA" stopOpacity={0.3} /><stop offset="100%" stopColor="#00FFAA" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="gMusic" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#6B8AFF" stopOpacity={0.3} /><stop offset="100%" stopColor="#6B8AFF" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                                            <XAxis dataKey="month" tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} />
                                            <YAxis tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="tickets" name="Entradas" stackId="1" stroke={ACCENT} fill="url(#gTickets)" />
                                            <Area type="monotone" dataKey="merch" name="Merch" stackId="1" stroke="#00FFAA" fill="url(#gMerch)" />
                                            <Area type="monotone" dataKey="music" name="Música" stackId="1" stroke="#6B8AFF" fill="url(#gMusic)" />
                                            <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 11 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : <NoData />}
                            </ChartCard>
                        </div>

                        {/* Recent Orders Table */}
                        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
                            <div className="px-6 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
                                <h3 className="font-mono font-bold text-[11px] uppercase tracking-[0.15em]" style={{ color: TEXT_MUTED }}>{t("recentOrders")}</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                                            {[t("date"), t("customer"), t("items"), t("amount"), t("status")].map(h => (
                                                <th key={h} className="px-5 py-3 text-left text-[10px] font-mono uppercase tracking-widest" style={{ color: TEXT_MUTED }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.orders.slice(0, 8).map(order => (
                                            <tr key={order._id} className="transition-colors hover:bg-[#1a1a1a]" style={{ borderBottom: `1px solid ${BORDER}` }}>
                                                <td className="px-5 py-3.5 text-xs font-mono whitespace-nowrap" style={{ color: TEXT_MUTED }}>
                                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) : "—"}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <p className="text-sm font-mono font-medium" style={{ color: "#FFF" }}>{order.customerName || "—"}</p>
                                                    <p className="text-[10px] font-mono" style={{ color: TEXT_MUTED }}>{order.customerEmail || ""}</p>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex flex-wrap gap-1">
                                                        {order.items?.slice(0, 2).map((item, i) => (
                                                            <span key={i} className="px-2 py-0.5 rounded text-[9px] font-mono" style={{ backgroundColor: BORDER, color: TEXT_MUTED }}>
                                                                {item.quantity > 1 ? `${item.quantity}× ` : ""}{item.name?.substring(0, 16) || item.type}
                                                            </span>
                                                        ))}
                                                        {(order.items?.length || 0) > 2 && <span className="text-[9px] font-mono" style={{ color: ACCENT }}>+{order.items!.length - 2}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-sm font-mono font-bold" style={{ color: "#FFF" }}>{(order.amount || 0).toFixed(2)}€</td>
                                                <td className="px-5 py-3.5"><StatusBadge status={order.status || "pending"} /></td>
                                            </tr>
                                        ))}
                                        {data.orders.length === 0 && (
                                            <tr><td colSpan={5} className="px-5 py-10 text-center font-mono text-sm" style={{ color: TEXT_MUTED }}>{t("noOrders")}</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════ */}
                {/* TICKETS VIEW */}
                {/* ═══════════════════════════════════════════════════ */}
                {activeView === "tickets" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Tickets by Event */}
                        <ChartCard title={t("ticketStatus")} span={2}>
                            {tByEvent.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={tByEvent}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                                        <XAxis dataKey="event" tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} />
                                        <YAxis tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 11 }} />
                                        <Bar dataKey="active" name={t("active")} fill={ACCENT} stackId="s" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="used" name={t("used")} fill="#00FFAA" stackId="s" />
                                        <Bar dataKey="cancelled" name={t("cancelled")} fill="#FF6B6B" stackId="s" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <NoData />}
                        </ChartCard>

                        {/* Ticket Status Pie */}
                        <ChartCard title="Estado General de Entradas">
                            {tStatusPie.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={tStatusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={5} dataKey="value"
                                            label={(p: any) => `${p.name} (${p.value})`}
                                            labelLine={{ stroke: TEXT_MUTED }}
                                        >
                                            {tStatusPie.map((d, i) => <Cell key={i} fill={STATUS_COLORS[d.name] || CHART_COLORS[i]} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <NoData />}
                        </ChartCard>

                        {/* Tickets sold over time */}
                        <ChartCard title="Entradas Vendidas por Mes">
                            {monthly.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <AreaChart data={monthly}>
                                        <defs>
                                            <linearGradient id="gTk" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={ACCENT} stopOpacity={0.4} /><stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                                        <XAxis dataKey="month" tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} />
                                        <YAxis tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="tickets" name="Entradas" stroke={ACCENT} strokeWidth={2} fill="url(#gTk)" dot={{ fill: ACCENT, r: 3 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : <NoData />}
                        </ChartCard>

                        {/* Event inventory */}
                        <ChartCard title="Resumen por Evento" span={2}>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {data.events.map(event => {
                                    const stats = tByEvent.find(e => e.event === event.title);
                                    const total = stats?.total || 0;
                                    const used = stats?.used || 0;
                                    const pct = total > 0 ? (used / total) * 100 : 0;
                                    return (
                                        <div key={event._id} className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: `${BORDER}60` }}>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-mono text-sm font-medium truncate" style={{ color: "#FFF" }}>{event.title}</p>
                                                <p className="font-mono text-[10px]" style={{ color: TEXT_MUTED }}>
                                                    {event.date ? new Date(event.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—"} · {event.price}€
                                                </p>
                                            </div>
                                            <div className="w-32 flex-shrink-0">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-[9px] font-mono" style={{ color: TEXT_MUTED }}>{used}/{total}</span>
                                                    <span className="text-[9px] font-mono font-bold" style={{ color: ACCENT }}>{pct.toFixed(0)}%</span>
                                                </div>
                                                <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: BORDER }}>
                                                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: ACCENT }} />
                                                </div>
                                            </div>
                                            <span className="font-mono text-sm font-bold flex-shrink-0" style={{ color: ACCENT }}>{total}</span>
                                        </div>
                                    );
                                })}
                                {data.events.length === 0 && <NoData />}
                            </div>
                        </ChartCard>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════ */}
                {/* MERCH VIEW */}
                {/* ═══════════════════════════════════════════════════ */}
                {activeView === "merch" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Merch sales by product */}
                        <ChartCard title="Ventas por Producto">
                            {mByProduct.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={mByProduct} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                                        <XAxis type="number" tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} />
                                        <YAxis type="category" dataKey="name" tick={{ fill: TEXT_MUTED, fontSize: 9, fontFamily: "monospace" }} stroke={BORDER} width={110} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="sold" name="Vendidos" fill={ACCENT} radius={[0, 6, 6, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <NoData />}
                        </ChartCard>

                        {/* Stock levels */}
                        <ChartCard title="Niveles de Stock">
                            {stockData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={stockData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                                        <XAxis dataKey="name" tick={{ fill: TEXT_MUTED, fontSize: 9, fontFamily: "monospace" }} stroke={BORDER} />
                                        <YAxis tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="stock" name="Stock" radius={[6, 6, 0, 0]}>
                                            {stockData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <NoData />}
                        </ChartCard>

                        {/* Revenue by merch product */}
                        <ChartCard title="Ingresos por Producto" span={2}>
                            {mByProduct.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={mByProduct}>
                                        <defs>
                                            <linearGradient id="gMR" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#00FFAA" stopOpacity={0.4} /><stop offset="100%" stopColor="#00FFAA" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                                        <XAxis dataKey="name" tick={{ fill: TEXT_MUTED, fontSize: 9, fontFamily: "monospace" }} stroke={BORDER} />
                                        <YAxis tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} tickFormatter={v => `${v}€`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="revenue" name="Ingresos €" stroke="#00FFAA" strokeWidth={2} fill="url(#gMR)" dot={{ fill: "#00FFAA", r: 3 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : <NoData />}
                        </ChartCard>

                        {/* Merch sold over time */}
                        <ChartCard title="Merch Vendido por Mes" span={2}>
                            {monthly.length > 0 ? (
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={monthly}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                                        <XAxis dataKey="month" tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} />
                                        <YAxis tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="merch" name="Merch" fill="#00FFAA" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <NoData />}
                        </ChartCard>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════ */}
                {/* MUSIC VIEW */}
                {/* ═══════════════════════════════════════════════════ */}
                {activeView === "music" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sales by album */}
                        <ChartCard title="Ventas por Álbum">
                            {muByAlbum.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={muByAlbum} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                                        <XAxis type="number" tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} />
                                        <YAxis type="category" dataKey="name" tick={{ fill: TEXT_MUTED, fontSize: 9, fontFamily: "monospace" }} stroke={BORDER} width={120} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 11 }} />
                                        <Bar dataKey="vinyl" name="Vinilo" fill={ACCENT} stackId="s" />
                                        <Bar dataKey="digital" name="Digital" fill="#6B8AFF" stackId="s" radius={[0, 6, 6, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <NoData />}
                        </ChartCard>

                        {/* Format pie */}
                        <ChartCard title="Formato de Venta">
                            {muFormatPie.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={muFormatPie} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={5} dataKey="value"
                                            label={(p: any) => `${p.name} (${p.value})`}
                                            labelLine={{ stroke: TEXT_MUTED }}
                                        >
                                            {muFormatPie.map((d, i) => <Cell key={i} fill={STATUS_COLORS[d.name] || CHART_COLORS[i]} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <NoData />}
                        </ChartCard>

                        {/* Revenue by album */}
                        <ChartCard title="Ingresos por Álbum" span={2}>
                            {muByAlbum.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={muByAlbum}>
                                        <defs>
                                            <linearGradient id="gMuR" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6B8AFF" stopOpacity={0.4} /><stop offset="100%" stopColor="#6B8AFF" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                                        <XAxis dataKey="name" tick={{ fill: TEXT_MUTED, fontSize: 9, fontFamily: "monospace" }} stroke={BORDER} />
                                        <YAxis tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} tickFormatter={v => `${v}€`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="revenue" name="Ingresos €" stroke="#6B8AFF" strokeWidth={2} fill="url(#gMuR)" dot={{ fill: "#6B8AFF", r: 3 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : <NoData />}
                        </ChartCard>

                        {/* Music sold over time */}
                        <ChartCard title="Música Vendida por Mes" span={2}>
                            {monthly.length > 0 ? (
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={monthly}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                                        <XAxis dataKey="month" tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} />
                                        <YAxis tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="music" name="Música" fill="#6B8AFF" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <NoData />}
                        </ChartCard>

                        {/* Album cards */}
                        <ChartCard title="Catálogo" span={2}>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {data.albums.map(album => {
                                    const sales = muByAlbum.find(a => a.name.startsWith(album.title.substring(0, 15)));
                                    return (
                                        <div key={album._id} className="rounded-lg p-4" style={{ backgroundColor: `${BORDER}60` }}>
                                            <p className="font-mono text-sm font-bold truncate" style={{ color: "#FFF" }}>{album.title}</p>
                                            <p className="font-mono text-[10px] mb-3" style={{ color: TEXT_MUTED }}>{album.artist}</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="text-center p-2 rounded" style={{ backgroundColor: `${ACCENT}10` }}>
                                                    <p className="text-[9px] font-mono uppercase" style={{ color: TEXT_MUTED }}>Vinilo</p>
                                                    <p className="font-mono text-sm font-bold" style={{ color: ACCENT }}>{sales?.vinyl || 0}</p>
                                                </div>
                                                <div className="text-center p-2 rounded" style={{ backgroundColor: `#6B8AFF10` }}>
                                                    <p className="text-[9px] font-mono uppercase" style={{ color: TEXT_MUTED }}>Digital</p>
                                                    <p className="font-mono text-sm font-bold" style={{ color: "#6B8AFF" }}>{sales?.digital || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ChartCard>
                    </div>
                )}
            </div>
        </>
    );
}
