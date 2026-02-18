"use client";

import { useState, useEffect, useMemo } from "react";
import { getDashboardData, DashboardData, updateMerchStock } from "@/app/actions/dashboard";
import { useTranslations } from "next-intl";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { EmptyState } from "@/components/admin/SharedComponents";
import { Loader2, Save, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ACCENT = "#CCFF00";
const CARD_BG = "#111111";
const BORDER = "#222222";
const TEXT_MUTED = "#888888";

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg p-3 font-mono text-sm" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, color: "#fff" }}>
            <p className="font-bold mb-1" style={{ color: ACCENT }}>{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color || TEXT_MUTED }}>{p.name}: {p.value}</p>
            ))}
        </div>
    );
}

export default function MerchPage() {
    const t = useTranslations("Admin");
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [stockEdits, setStockEdits] = useState<Record<string, number>>({});
    const [savingId, setSavingId] = useState<string | null>(null);
    const [savedId, setSavedId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try { setData(await getDashboardData()); } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    // Compute sold units per merch from orders
    const merchSold = useMemo(() => {
        if (!data) return {};
        const map: Record<string, number> = {};
        for (const o of data.orders) {
            if (o.status !== "paid" && o.status !== "shipped") continue;
            if (!o.items) continue;
            for (const item of o.items) {
                if (item.type !== "merch") continue;
                const name = item.name || "";
                map[name] = (map[name] || 0) + (item.quantity || 1);
            }
        }
        return map;
    }, [data]);

    const salesChartData = useMemo(() => {
        if (!data) return [];
        return data.merch.map((m) => ({
            name: m.title.substring(0, 20),
            sold: Object.entries(merchSold).find(([k]) => k.includes(m.title.substring(0, 10)))?.[1] || 0,
            stock: m.stock ?? 0,
        }));
    }, [data, merchSold]);

    const handleSaveStock = async (merchId: string) => {
        if (stockEdits[merchId] === undefined) return;
        setSavingId(merchId);
        const res = await updateMerchStock(merchId, stockEdits[merchId]);
        if (res.success) {
            setSavedId(merchId);
            setTimeout(() => setSavedId(null), 2000);
            await fetchData();
        }
        setSavingId(null);
    };

    const lowStockItems = useMemo(() => data?.merch.filter((m) => (m.stock ?? 0) <= 5) || [], [data]);

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: ACCENT }} />
            </div>
        );
    }

    return (
        <>
            <AdminHeader title={t("merch_title")} subtitle={t("merch_subtitle")} onRefresh={fetchData} refreshLabel={t("refresh")} isRefreshing={loading} />
            <div className="px-6 py-8 space-y-8">
                {/* Low stock alert */}
                {lowStockItems.length > 0 && (
                    <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: "#FF6B6B10", border: "1px solid #FF6B6B40" }}>
                        <AlertTriangle className="w-5 h-5" style={{ color: "#FF6B6B" }} />
                        <span className="font-mono text-sm" style={{ color: "#FF6B6B" }}>
                            {t("merch_lowStock")}: {lowStockItems.map((m) => m.title).join(", ")}
                        </span>
                    </div>
                )}

                {/* Merch table */}
                <div className="rounded-xl overflow-hidden" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                                    {[t("merch_product"), t("merch_price"), t("merch_stock"), t("merch_sold"), t("merch_updateStock")].map((h) => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-mono uppercase tracking-widest" style={{ color: TEXT_MUTED }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data?.merch.map((m) => {
                                    const sold = Object.entries(merchSold).find(([k]) => k.includes(m.title.substring(0, 10)))?.[1] || 0;
                                    const isLow = (m.stock ?? 0) <= 5;
                                    const currentStock = stockEdits[m._id] ?? m.stock ?? 0;
                                    return (
                                        <tr key={m._id} className="transition-colors hover:bg-[#1a1a1a]" style={{ borderBottom: `1px solid ${BORDER}` }}>
                                            <td className="px-5 py-4">
                                                <p className="font-mono text-sm font-medium" style={{ color: "#FFF" }}>{m.title}</p>
                                            </td>
                                            <td className="px-5 py-4 font-mono text-sm" style={{ color: "#FFF" }}>{m.price?.toFixed(2)}€</td>
                                            <td className="px-5 py-4">
                                                <span className="font-mono text-sm font-bold" style={{ color: isLow ? "#FF6B6B" : ACCENT }}>
                                                    {m.stock ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 font-mono text-sm" style={{ color: TEXT_MUTED }}>{sold}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={currentStock}
                                                        onChange={(e) => setStockEdits({ ...stockEdits, [m._id]: parseInt(e.target.value) || 0 })}
                                                        className="w-20 bg-transparent border rounded-lg px-2 py-1 font-mono text-sm text-center"
                                                        style={{ borderColor: BORDER, color: "#FFF" }}
                                                    />
                                                    <button
                                                        onClick={() => handleSaveStock(m._id)}
                                                        disabled={savingId === m._id || currentStock === (m.stock ?? 0)}
                                                        className="p-1.5 rounded-lg transition-all disabled:opacity-30"
                                                        style={{ backgroundColor: `${ACCENT}20`, color: ACCENT }}
                                                    >
                                                        {savingId === m._id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : savedId === m._id ? (
                                                            <span className="text-xs font-mono">✓</span>
                                                        ) : (
                                                            <Save className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {(!data?.merch || data.merch.length === 0) && <EmptyState message={t("noData")} />}
                    </div>
                </div>

                {/* Sales chart */}
                {salesChartData.length > 0 && (
                    <div className="rounded-xl p-6" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
                        <h2 className="font-mono font-bold text-sm uppercase tracking-widest mb-6" style={{ color: TEXT_MUTED }}>{t("merch_salesChart")}</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={salesChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                                <XAxis dataKey="name" tick={{ fill: TEXT_MUTED, fontSize: 11, fontFamily: "monospace" }} stroke={BORDER} />
                                <YAxis tick={{ fill: TEXT_MUTED, fontSize: 11, fontFamily: "monospace" }} stroke={BORDER} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="sold" name={t("merch_sold")} fill={ACCENT} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="stock" name={t("merch_stock")} fill="#6B8AFF" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </>
    );
}
