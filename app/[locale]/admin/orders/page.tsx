"use client";

import { useState, useEffect, useMemo } from "react";
import { getDashboardData, DashboardData, updateOrderStatus } from "@/app/actions/dashboard";
import { useTranslations } from "next-intl";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAdminMobileMenu } from "@/app/[locale]/admin/layout";
import { StatusBadge, SearchBar, FilterButton, ExportCSV, EmptyState } from "@/components/admin/SharedComponents";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";

const ACCENT = "#CCFF00";
const CARD_BG = "#111111";
const BORDER = "#222222";
const TEXT_MUTED = "#888888";

const STATUS_FILTERS = ["all", "paid", "pending", "shipped", "cancelled"] as const;

export default function OrdersPage() {
    const t = useTranslations("Admin");
    const { toggleMobileMenu } = useAdminMobileMenu();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try { setData(await getDashboardData()); } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const filteredOrders = useMemo(() => {
        if (!data) return [];
        let orders = data.orders;
        if (statusFilter !== "all") {
            orders = orders.filter((o) => o.status === statusFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            orders = orders.filter(
                (o) =>
                    (o.customerName || "").toLowerCase().includes(q) ||
                    (o.customerEmail || "").toLowerCase().includes(q) ||
                    (o.orderId || "").toLowerCase().includes(q)
            );
        }
        return orders;
    }, [data, statusFilter, search]);

    const csvData = useMemo(() =>
        filteredOrders.map((o) => ({
            orderId: o.orderId,
            date: o.createdAt ? new Date(o.createdAt).toISOString() : "",
            customer: o.customerName || "",
            email: o.customerEmail || "",
            amount: o.amount || 0,
            status: o.status || "",
            items: o.items?.map((i) => `${i.quantity}×${i.name}`).join("; ") || "",
        }))
        , [filteredOrders]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdatingStatus(orderId);
        const res = await updateOrderStatus(orderId, newStatus);
        if (res.success) await fetchData();
        setUpdatingStatus(null);
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: ACCENT }} />
            </div>
        );
    }

    return (
        <>
            <AdminHeader title={t("orders_title")} subtitle={t("orders_subtitle")} onRefresh={fetchData} refreshLabel={t("refresh")} isRefreshing={loading} onMenuToggle={toggleMobileMenu} />
            <div className="px-4 py-6 lg:px-6 lg:py-8 space-y-6">
                {/* Search + Filters */}
                <SearchBar value={search} onChange={setSearch} placeholder={t("orders_search")}>
                    <div className="flex gap-2 flex-wrap">
                        {STATUS_FILTERS.map((s) => (
                            <FilterButton key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                                {t(`orders_${s}`)}
                            </FilterButton>
                        ))}
                    </div>
                    <ExportCSV data={csvData} filename="orders" />
                </SearchBar>

                {/* Orders Table */}
                <div className="rounded-xl overflow-hidden" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                                    {[t("orders_id"), t("date"), t("customer"), t("items"), t("amount"), t("status"), ""].map((h, i) => (
                                        <th key={i} className="px-5 py-3 text-left text-xs font-mono uppercase tracking-widest" style={{ color: TEXT_MUTED }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => {
                                    const isExpanded = expandedOrder === order._id;
                                    return (
                                        <tr key={order._id} className="group" style={{ borderBottom: `1px solid ${BORDER}` }}>
                                            <td colSpan={7} className="p-0">
                                                {/* Main row */}
                                                <div
                                                    className="grid items-center cursor-pointer transition-colors hover:bg-[#1a1a1a] px-3 sm:px-5 py-4"
                                                    style={{ gridTemplateColumns: "100px 80px 1fr 1fr 80px 90px 32px" }}
                                                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                                                >
                                                    <span className="text-xs font-mono" style={{ color: ACCENT }}>
                                                        {(order.orderId || order._id).substring(0, 12)}...
                                                    </span>
                                                    <span className="text-xs font-mono" style={{ color: TEXT_MUTED }}>
                                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) : "—"}
                                                    </span>
                                                    <div>
                                                        <p className="text-sm font-mono font-medium" style={{ color: "#FFF" }}>{order.customerName || "—"}</p>
                                                        <p className="text-xs font-mono" style={{ color: TEXT_MUTED }}>{order.customerEmail || ""}</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {order.items?.slice(0, 2).map((item, i) => (
                                                            <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: BORDER, color: TEXT_MUTED }}>
                                                                {item.quantity > 1 ? `${item.quantity}× ` : ""}{item.name?.substring(0, 15) || item.type}
                                                            </span>
                                                        ))}
                                                        {(order.items?.length || 0) > 2 && (
                                                            <span className="text-[10px] font-mono" style={{ color: ACCENT }}>+{order.items!.length - 2}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-mono font-bold" style={{ color: "#FFF" }}>{(order.amount || 0).toFixed(2)}€</span>
                                                    <StatusBadge status={order.status || "pending"} />
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-4 h-4" style={{ color: TEXT_MUTED }} />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" style={{ color: TEXT_MUTED }} />
                                                    )}
                                                </div>

                                                {/* Expanded detail */}
                                                {isExpanded && (
                                                    <div className="px-5 pb-5 pt-2 space-y-4" style={{ borderTop: `1px solid ${BORDER}` }}>
                                                        {/* Items table */}
                                                        <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                                                            <table className="w-full min-w-[400px]">
                                                                <thead>
                                                                    <tr style={{ backgroundColor: BORDER }}>
                                                                        {[t("items"), t("orders_type"), t("orders_qty"), t("orders_unitPrice"), t("amount")].map((h) => (
                                                                            <th key={h} className="px-4 py-2 text-left text-[10px] font-mono uppercase tracking-widest" style={{ color: TEXT_MUTED }}>{h}</th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {order.items?.map((item, i) => (
                                                                        <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                                                                            <td className="px-4 py-2 text-sm font-mono" style={{ color: "#FFF" }}>{item.name || "—"}</td>
                                                                            <td className="px-4 py-2">
                                                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase" style={{ backgroundColor: `${ACCENT}15`, color: ACCENT }}>{item.type}</span>
                                                                            </td>
                                                                            <td className="px-4 py-2 text-sm font-mono" style={{ color: TEXT_MUTED }}>{item.quantity}</td>
                                                                            <td className="px-4 py-2 text-sm font-mono" style={{ color: TEXT_MUTED }}>{(item.price || 0).toFixed(2)}€</td>
                                                                            <td className="px-4 py-2 text-sm font-mono font-bold" style={{ color: "#FFF" }}>{((item.price || 0) * (item.quantity || 1)).toFixed(2)}€</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        {/* Change status */}
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-mono text-xs" style={{ color: TEXT_MUTED }}>{t("orders_changeStatus")}:</span>
                                                            {["pending", "paid", "shipped", "cancelled"].map((s) => (
                                                                <button
                                                                    key={s}
                                                                    onClick={() => handleStatusChange(order.orderId, s)}
                                                                    disabled={order.status === s || updatingStatus === order.orderId}
                                                                    className="px-3 py-1 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all disabled:opacity-30"
                                                                    style={{
                                                                        backgroundColor: order.status === s ? `${ACCENT}20` : "transparent",
                                                                        color: order.status === s ? ACCENT : TEXT_MUTED,
                                                                        border: `1px solid ${order.status === s ? ACCENT : BORDER}`,
                                                                    }}
                                                                >
                                                                    {updatingStatus === order.orderId ? "..." : s}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredOrders.length === 0 && <EmptyState message={t("noOrders")} />}
                    </div>
                </div>
            </div>
        </>
    );
}
