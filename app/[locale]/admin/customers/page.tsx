"use client";

import { useState, useEffect, useMemo } from "react";
import { getDashboardData, DashboardData } from "@/app/actions/dashboard";
import { useTranslations } from "next-intl";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAdminMobileMenu } from "@/app/[locale]/admin/layout";
import { StatusBadge, SearchBar, EmptyState } from "@/components/admin/SharedComponents";
import { Loader2, Crown, ChevronDown, ChevronUp } from "lucide-react";

const ACCENT = "#CCFF00";
const CARD_BG = "#111111";
const BORDER = "#222222";
const TEXT_MUTED = "#888888";

interface CustomerRow {
    name: string;
    email: string;
    orderCount: number;
    totalSpent: number;
    lastOrder: string;
    orders: DashboardData["orders"];
}

export default function CustomersPage() {
    const t = useTranslations("Admin");
    const { toggleMobileMenu } = useAdminMobileMenu();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try { setData(await getDashboardData()); } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const customers = useMemo(() => {
        if (!data) return [];
        const map: Record<string, CustomerRow> = {};
        for (const order of data.orders) {
            const email = order.customerEmail || "unknown";
            if (!map[email]) {
                map[email] = {
                    name: order.customerName || "—",
                    email,
                    orderCount: 0,
                    totalSpent: 0,
                    lastOrder: order.createdAt || "",
                    orders: [],
                };
            }
            map[email].orderCount++;
            if (order.status === "paid" || order.status === "shipped") {
                map[email].totalSpent += order.amount || 0;
            }
            if (order.createdAt && order.createdAt > map[email].lastOrder) {
                map[email].lastOrder = order.createdAt;
            }
            map[email].orders.push(order);
        }
        return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
    }, [data]);

    const topSpenders = useMemo(() => new Set(customers.slice(0, 10).map((c) => c.email)), [customers]);

    const filtered = useMemo(() => {
        if (!search.trim()) return customers;
        const q = search.toLowerCase();
        return customers.filter(
            (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
        );
    }, [customers, search]);

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: ACCENT }} />
            </div>
        );
    }

    return (
        <>
            <AdminHeader title={t("customers_title")} subtitle={t("customers_subtitle")} onRefresh={fetchData} refreshLabel={t("refresh")} isRefreshing={loading} onMenuToggle={toggleMobileMenu} />
            <div className="px-4 py-6 lg:px-6 lg:py-8 space-y-6">
                <SearchBar value={search} onChange={setSearch} placeholder={t("customers_search")} />

                {/* Customers table */}
                <div className="rounded-xl overflow-hidden" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                                    {["", t("customers_name"), t("customers_email"), t("customers_orderCount"), t("customers_totalSpent"), t("customers_lastOrder"), ""].map((h, i) => (
                                        <th key={i} className="px-5 py-3 text-left text-xs font-mono uppercase tracking-widest" style={{ color: TEXT_MUTED }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((customer) => {
                                    const isVip = topSpenders.has(customer.email);
                                    const isExpanded = expandedCustomer === customer.email;
                                    return (
                                        <tr key={customer.email} style={{ borderBottom: `1px solid ${BORDER}` }}>
                                            <td colSpan={7} className="p-0">
                                                <div
                                                    className="grid items-center cursor-pointer transition-colors hover:bg-[#1a1a1a] px-3 sm:px-5 py-4"
                                                    style={{ gridTemplateColumns: "32px 1fr 1fr 70px 90px 100px 32px" }}
                                                    onClick={() => setExpandedCustomer(isExpanded ? null : customer.email)}
                                                >
                                                    <div>
                                                        {isVip && <Crown className="w-4 h-4" style={{ color: "#FFB86B" }} />}
                                                    </div>
                                                    <span className="font-mono text-sm font-medium" style={{ color: "#FFF" }}>{customer.name}</span>
                                                    <span className="font-mono text-xs" style={{ color: TEXT_MUTED }}>{customer.email}</span>
                                                    <span className="font-mono text-sm text-center" style={{ color: "#FFF" }}>{customer.orderCount}</span>
                                                    <span className="font-mono text-sm font-bold" style={{ color: ACCENT }}>{customer.totalSpent.toFixed(2)}€</span>
                                                    <span className="font-mono text-xs" style={{ color: TEXT_MUTED }}>
                                                        {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                                    </span>
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-4 h-4" style={{ color: TEXT_MUTED }} />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" style={{ color: TEXT_MUTED }} />
                                                    )}
                                                </div>
                                                {isExpanded && (
                                                    <div className="px-5 pb-5 pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
                                                        <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: TEXT_MUTED }}>{t("customers_orderHistory")}</p>
                                                        <div className="space-y-2">
                                                            {customer.orders.map((order) => (
                                                                <div key={order._id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${BORDER}80` }}>
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="font-mono text-xs" style={{ color: TEXT_MUTED }}>
                                                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString("es-ES") : "—"}
                                                                        </span>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {order.items?.slice(0, 3).map((item, i) => (
                                                                                <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: BORDER, color: TEXT_MUTED }}>
                                                                                    {item.quantity > 1 ? `${item.quantity}× ` : ""}{item.name?.substring(0, 18) || item.type}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="font-mono text-sm font-bold" style={{ color: "#FFF" }}>{(order.amount || 0).toFixed(2)}€</span>
                                                                        <StatusBadge status={order.status || "pending"} />
                                                                    </div>
                                                                </div>
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
                        {filtered.length === 0 && <EmptyState message={t("noData")} />}
                    </div>
                </div>
            </div>
        </>
    );
}
