"use client";

import { useState, useEffect, useMemo } from "react";
import { getDashboardData, DashboardData, cancelTicket } from "@/app/actions/dashboard";
import { useTranslations } from "next-intl";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAdminMobileMenu } from "@/app/[locale]/admin/layout";
import { StatusBadge, FilterButton, EmptyState } from "@/components/admin/SharedComponents";
import { Loader2, MapPin, Calendar, X } from "lucide-react";

const ACCENT = "#CCFF00";
const CARD_BG = "#111111";
const BORDER = "#222222";
const TEXT_MUTED = "#888888";

function getEventStatus(date: string): "upcoming" | "past" | "today" {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) return "today";
    return d > today ? "upcoming" : "past";
}

export default function TicketsPage() {
    const t = useTranslations("Admin");
    const { toggleMobileMenu } = useAdminMobileMenu();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [eventFilter, setEventFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try { setData(await getDashboardData()); } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const filteredTickets = useMemo(() => {
        if (!data) return [];
        let tickets = data.tickets;
        if (eventFilter !== "all") tickets = tickets.filter((t) => t.eventTitle === eventFilter);
        if (statusFilter !== "all") tickets = tickets.filter((t) => t.status === statusFilter);
        return tickets;
    }, [data, eventFilter, statusFilter]);

    const eventNames = useMemo(() => {
        if (!data) return [];
        return Array.from(new Set(data.tickets.map((t) => t.eventTitle).filter(Boolean)));
    }, [data]);

    const ticketStats = useMemo(() => {
        if (!data) return {};
        const stats: Record<string, { active: number; used: number; cancelled: number; total: number }> = {};
        for (const t of data.tickets) {
            const ev = t.eventTitle || "—";
            if (!stats[ev]) stats[ev] = { active: 0, used: 0, cancelled: 0, total: 0 };
            stats[ev].total++;
            if (t.status === "active") stats[ev].active++;
            else if (t.status === "used") stats[ev].used++;
            else if (t.status === "cancelled") stats[ev].cancelled++;
        }
        return stats;
    }, [data]);

    const handleCancel = async (ticketId: string) => {
        if (!confirm(t("tickets_cancelConfirm"))) return;
        setCancellingId(ticketId);
        await cancelTicket(ticketId);
        await fetchData();
        setCancellingId(null);
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
            <AdminHeader title={t("tickets_title")} subtitle={t("tickets_subtitle")} onRefresh={fetchData} refreshLabel={t("refresh")} isRefreshing={loading} onMenuToggle={toggleMobileMenu} />
            <div className="px-4 py-6 lg:px-6 lg:py-8 space-y-6 lg:space-y-8">
                {/* Event cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {data?.events.map((event) => {
                        const status = event.date ? getEventStatus(event.date) : "past";
                        const stats = ticketStats[event.title] || { active: 0, used: 0, cancelled: 0, total: 0 };
                        const statusColor = status === "upcoming" ? ACCENT : status === "today" ? "#00FFAA" : TEXT_MUTED;
                        return (
                            <div
                                key={event._id}
                                className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                                style={{ backgroundColor: CARD_BG, border: `1px solid ${eventFilter === event.title ? ACCENT : BORDER}` }}
                                onClick={() => setEventFilter(eventFilter === event.title ? "all" : event.title)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-mono font-bold text-sm" style={{ color: "#FFF" }}>{event.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-3 h-3" style={{ color: TEXT_MUTED }} />
                                            <span className="font-mono text-xs" style={{ color: TEXT_MUTED }}>
                                                {event.date ? new Date(event.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
                                        {t(`tickets_${status}`)}
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-3 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono text-xs" style={{ color: TEXT_MUTED }}>{stats.total} {t("tickets")}</span>
                                        <span className="font-mono text-xs font-bold" style={{ color: ACCENT }}>{event.price}€</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: BORDER }}>
                                        <div className="h-full flex">
                                            {stats.used > 0 && <div style={{ width: `${(stats.used / Math.max(stats.total, 1)) * 100}%`, backgroundColor: "#00FFAA" }} />}
                                            {stats.active > 0 && <div style={{ width: `${(stats.active / Math.max(stats.total, 1)) * 100}%`, backgroundColor: ACCENT }} />}
                                            {stats.cancelled > 0 && <div style={{ width: `${(stats.cancelled / Math.max(stats.total, 1)) * 100}%`, backgroundColor: "#FF6B6B" }} />}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 text-[10px] font-mono" style={{ color: TEXT_MUTED }}>
                                        <span><span style={{ color: ACCENT }}>●</span> {stats.active} {t("active")}</span>
                                        <span><span style={{ color: "#00FFAA" }}>●</span> {stats.used} {t("used")}</span>
                                        <span><span style={{ color: "#FF6B6B" }}>●</span> {stats.cancelled} {t("cancelled")}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Ticket filters */}
                <div className="flex gap-2 flex-wrap items-center">
                    <FilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>{t("orders_all")}</FilterButton>
                    <FilterButton active={statusFilter === "active"} onClick={() => setStatusFilter("active")}>{t("active")}</FilterButton>
                    <FilterButton active={statusFilter === "used"} onClick={() => setStatusFilter("used")}>{t("used")}</FilterButton>
                    <FilterButton active={statusFilter === "cancelled"} onClick={() => setStatusFilter("cancelled")}>{t("cancelled")}</FilterButton>
                    {eventFilter !== "all" && (
                        <button
                            onClick={() => setEventFilter("all")}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-mono text-xs"
                            style={{ backgroundColor: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}` }}
                        >
                            {eventFilter} <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Tickets table */}
                <div className="rounded-xl overflow-hidden" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                                    {[t("tickets_code"), t("tickets_event"), t("tickets_attendee"), t("status"), ""].map((h, i) => (
                                        <th key={i} className="px-5 py-3 text-left text-xs font-mono uppercase tracking-widest" style={{ color: TEXT_MUTED }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets.map((ticket) => (
                                    <tr key={ticket._id} className="transition-colors hover:bg-[#1a1a1a]" style={{ borderBottom: `1px solid ${BORDER}` }}>
                                        <td className="px-5 py-4 text-xs font-mono" style={{ color: ACCENT }}>
                                            {ticket.code?.substring(0, 12)}...
                                        </td>
                                        <td className="px-5 py-4 text-sm font-mono" style={{ color: "#FFF" }}>
                                            {ticket.eventTitle || "—"}
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-mono" style={{ color: "#FFF" }}>{ticket.attendeeName || "—"}</p>
                                            <p className="text-xs font-mono" style={{ color: TEXT_MUTED }}>{ticket.attendeeEmail || ""}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge status={ticket.status} />
                                        </td>
                                        <td className="px-5 py-4">
                                            {ticket.status === "active" && (
                                                <button
                                                    onClick={() => handleCancel(ticket._id)}
                                                    disabled={cancellingId === ticket._id}
                                                    className="px-3 py-1 rounded-lg font-mono text-[10px] uppercase transition-colors hover:bg-[#FF6B6B20]"
                                                    style={{ color: "#FF6B6B", border: `1px solid #FF6B6B40` }}
                                                >
                                                    {cancellingId === ticket._id ? "..." : t("tickets_cancel")}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredTickets.length === 0 && <EmptyState message={t("noData")} />}
                    </div>
                </div>
            </div>
        </>
    );
}
