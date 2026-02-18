"use client";

import { useState, useEffect, useMemo } from "react";
import { getDashboardData, DashboardData } from "@/app/actions/dashboard";
import { useTranslations } from "next-intl";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { EmptyState } from "@/components/admin/SharedComponents";
import { Loader2, Disc3 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const ACCENT = "#CCFF00";
const CARD_BG = "#111111";
const BORDER = "#222222";
const TEXT_MUTED = "#888888";
const CHART_COLORS = ["#CCFF00", "#00FFAA", "#FF6B6B", "#6B8AFF", "#FFB86B"];

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

export default function MusicPage() {
    const t = useTranslations("Admin");
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try { setData(await getDashboardData()); } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    // Compute sales per album from orders
    const albumSales = useMemo(() => {
        if (!data) return [];
        const map: Record<string, { vinyl: number; digital: number; tracks: number }> = {};
        for (const o of data.orders) {
            if (o.status !== "paid" && o.status !== "shipped") continue;
            if (!o.items) continue;
            for (const item of o.items) {
                if (item.type === "event" || item.type === "merch") continue;
                const name = item.name || "Unknown";
                if (!map[name]) map[name] = { vinyl: 0, digital: 0, tracks: 0 };
                const qty = item.quantity || 1;
                if (item.type === "album_physical") map[name].vinyl += qty;
                else if (item.type === "album_digital") map[name].digital += qty;
                else if (item.type === "track") map[name].tracks += qty;
            }
        }
        return Object.entries(map)
            .map(([name, s]) => ({ name: name.substring(0, 25), ...s, total: s.vinyl + s.digital + s.tracks }))
            .sort((a, b) => b.total - a.total);
    }, [data]);

    // Format breakdown (vinyl vs digital vs tracks)
    const formatData = useMemo(() => {
        let vinyl = 0, digital = 0, tracks = 0;
        for (const a of albumSales) {
            vinyl += a.vinyl;
            digital += a.digital;
            tracks += a.tracks;
        }
        return [
            { name: t("music_vinyl"), value: vinyl },
            { name: t("music_digital"), value: digital },
            { name: t("music_trackSales"), value: tracks },
        ].filter((d) => d.value > 0);
    }, [albumSales, t]);

    // Top tracks
    const topTracks = useMemo(() => {
        if (!data) return [];
        const map: Record<string, number> = {};
        for (const o of data.orders) {
            if (o.status !== "paid" && o.status !== "shipped") continue;
            if (!o.items) continue;
            for (const item of o.items) {
                if (item.type !== "track") continue;
                const name = item.name || "Unknown";
                map[name] = (map[name] || 0) + (item.quantity || 1);
            }
        }
        return Object.entries(map)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [data]);

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: ACCENT }} />
            </div>
        );
    }

    return (
        <>
            <AdminHeader title={t("music_title")} subtitle={t("music_subtitle")} onRefresh={fetchData} refreshLabel={t("refresh")} isRefreshing={loading} />
            <div className="px-6 py-8 space-y-8">
                {/* Album cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {data?.albums.map((album) => {
                        const sales = albumSales.find((s) => s.name.startsWith(album.title.substring(0, 20)));
                        return (
                            <div key={album._id} className="rounded-xl p-5" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ACCENT}15` }}>
                                        <Disc3 className="w-6 h-6" style={{ color: ACCENT }} />
                                    </div>
                                    <div>
                                        <h3 className="font-mono font-bold text-sm" style={{ color: "#FFF" }}>{album.title}</h3>
                                        <p className="font-mono text-xs" style={{ color: TEXT_MUTED }}>{album.artist}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-lg p-3 text-center" style={{ backgroundColor: `${BORDER}80` }}>
                                        <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: TEXT_MUTED }}>{t("music_vinyl")}</p>
                                        <p className="font-mono text-lg font-bold" style={{ color: "#FFF" }}>{album.physicalPrice?.toFixed(2) || "—"}€</p>
                                        <p className="font-mono text-xs" style={{ color: ACCENT }}>{sales?.vinyl || 0} {t("music_unitsSold")}</p>
                                    </div>
                                    <div className="rounded-lg p-3 text-center" style={{ backgroundColor: `${BORDER}80` }}>
                                        <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: TEXT_MUTED }}>{t("music_digital")}</p>
                                        <p className="font-mono text-lg font-bold" style={{ color: "#FFF" }}>{album.digitalPrice?.toFixed(2) || "—"}€</p>
                                        <p className="font-mono text-xs" style={{ color: "#00FFAA" }}>{sales?.digital || 0} {t("music_unitsSold")}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {(!data?.albums || data.albums.length === 0) && <EmptyState message={t("noData")} />}
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales by Format */}
                    <div className="rounded-xl p-6" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
                        <h2 className="font-mono font-bold text-sm uppercase tracking-widest mb-6" style={{ color: TEXT_MUTED }}>{t("music_salesByFormat")}</h2>
                        {formatData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={formatData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value"
                                        label={(props: any) => `${props.name || ''} ${props.value}`}>
                                        {formatData.map((_, idx) => (
                                            <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 12, color: TEXT_MUTED }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center font-mono text-sm" style={{ color: TEXT_MUTED }}>{t("noData")}</div>
                        )}
                    </div>

                    {/* Album sales bar chart */}
                    <div className="rounded-xl p-6" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
                        <h2 className="font-mono font-bold text-sm uppercase tracking-widest mb-6" style={{ color: TEXT_MUTED }}>{t("music_albumSales")}</h2>
                        {albumSales.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={albumSales} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                                    <XAxis type="number" tick={{ fill: TEXT_MUTED, fontSize: 11, fontFamily: "monospace" }} stroke={BORDER} />
                                    <YAxis type="category" dataKey="name" tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: "monospace" }} stroke={BORDER} width={120} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="vinyl" name={t("music_vinyl")} fill={ACCENT} stackId="a" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="digital" name={t("music_digital")} fill="#00FFAA" stackId="a" />
                                    <Bar dataKey="tracks" name={t("music_trackSales")} fill="#6B8AFF" stackId="a" radius={[0, 4, 4, 0]} />
                                    <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 12 }} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center font-mono text-sm" style={{ color: TEXT_MUTED }}>{t("noData")}</div>
                        )}
                    </div>
                </div>

                {/* Top tracks */}
                {topTracks.length > 0 && (
                    <div className="rounded-xl p-6" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
                        <h2 className="font-mono font-bold text-sm uppercase tracking-widest mb-4" style={{ color: TEXT_MUTED }}>{t("music_topTracks")}</h2>
                        <div className="space-y-2">
                            {topTracks.map((track, i) => (
                                <div key={track.name} className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: `${BORDER}80` }}>
                                    <span className="font-mono text-sm font-bold w-6 text-center" style={{ color: i < 3 ? ACCENT : TEXT_MUTED }}>
                                        #{i + 1}
                                    </span>
                                    <span className="font-mono text-sm flex-1" style={{ color: "#FFF" }}>{track.name}</span>
                                    <span className="font-mono text-sm font-bold" style={{ color: ACCENT }}>{track.count} {t("music_unitsSold")}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
