"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    BarChart3,
    ShoppingCart,
    Ticket,
    Music,
    Shirt,
    Users,
    ChevronLeft,
    ChevronRight,
    LogOut,
    X,
} from "lucide-react";
import { useAdminAuth } from "./AdminAuthProvider";
import { useState } from "react";

const ACCENT = "#CCFF00";
const BG_SIDEBAR = "#0D0D0D";
const BORDER = "#222222";
const TEXT_MUTED = "#888888";

interface NavItem {
    key: string;
    icon: any;
    href: string;
}

const NAV_ITEMS: NavItem[] = [
    { key: "dashboard", icon: BarChart3, href: "" },
    { key: "orders", icon: ShoppingCart, href: "/orders" },
    { key: "tickets", icon: Ticket, href: "/tickets" },
    { key: "music", icon: Music, href: "/music" },
    { key: "merch", icon: Shirt, href: "/merch" },
    { key: "customers", icon: Users, href: "/customers" },
];

interface AdminSidebarProps {
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onMobileClose }: AdminSidebarProps) {
    const t = useTranslations("Admin");
    const pathname = usePathname();
    const { logout } = useAdminAuth();
    const [collapsed, setCollapsed] = useState(false);

    // Extract locale from pathname (e.g. /es/admin/orders -> es)
    const segments = pathname.split("/");
    const locale = segments[1] || "es";
    const basePath = `/${locale}/admin`;

    const isActive = (href: string) => {
        const fullPath = `${basePath}${href}`;
        if (href === "") return pathname === basePath || pathname === `${basePath}/`;
        return pathname.startsWith(fullPath);
    };

    const handleNavClick = () => {
        // Close mobile sidebar when a nav link is clicked
        if (onMobileClose) onMobileClose();
    };

    return (
        <>
            {/* ── Mobile backdrop ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`
                    fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300
                    ${collapsed ? "lg:w-[72px]" : "lg:w-[260px]"}
                    w-[260px]
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0
                `}
                style={{
                    backgroundColor: BG_SIDEBAR,
                    borderRight: `1px solid ${BORDER}`,
                }}
            >
                {/* Logo / Brand */}
                <div
                    className="flex items-center gap-3 px-5 py-5"
                    style={{ borderBottom: `1px solid ${BORDER}` }}
                >
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${ACCENT}15` }}
                    >
                        <BarChart3 className="w-5 h-5" style={{ color: ACCENT }} />
                    </div>
                    {(!collapsed || mobileOpen) && (
                        <div className="overflow-hidden flex-1">
                            <p className="font-mono font-bold text-sm text-white truncate">
                                La Kultural
                            </p>
                            <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: TEXT_MUTED }}>
                                {t("nav_admin")}
                            </p>
                        </div>
                    )}
                    {/* Mobile close button */}
                    {mobileOpen && (
                        <button
                            onClick={onMobileClose}
                            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-[#1a1a1a] transition-colors"
                        >
                            <X className="w-4 h-4" style={{ color: TEXT_MUTED }} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        const showLabel = mobileOpen || !collapsed;
                        return (
                            <Link
                                key={item.key}
                                href={`${basePath}${item.href}`}
                                onClick={handleNavClick}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${!showLabel ? "justify-center" : ""}`}
                                style={{
                                    backgroundColor: active ? `${ACCENT}15` : "transparent",
                                    color: active ? ACCENT : TEXT_MUTED,
                                }}
                            >
                                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                                {showLabel && (
                                    <span
                                        className="font-mono text-sm truncate transition-colors group-hover:text-white"
                                        style={{ color: active ? "#FFFFFF" : TEXT_MUTED }}
                                    >
                                        {t(`nav_${item.key}`)}
                                    </span>
                                )}
                                {active && showLabel && (
                                    <div
                                        className="ml-auto w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: ACCENT }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom actions */}
                <div className="px-3 py-4 space-y-2" style={{ borderTop: `1px solid ${BORDER}` }}>
                    {/* Collapse toggle — desktop only */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`hidden lg:flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-colors hover:bg-[#1a1a1a] ${collapsed ? "justify-center" : ""}`}
                    >
                        {collapsed ? (
                            <ChevronRight className="w-4 h-4" style={{ color: TEXT_MUTED }} />
                        ) : (
                            <>
                                <ChevronLeft className="w-4 h-4" style={{ color: TEXT_MUTED }} />
                                <span className="font-mono text-xs" style={{ color: TEXT_MUTED }}>
                                    {t("nav_collapse")}
                                </span>
                            </>
                        )}
                    </button>

                    {/* Logout */}
                    <button
                        onClick={() => { logout(); if (onMobileClose) onMobileClose(); }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-colors hover:bg-[#FF6B6B15] ${collapsed && !mobileOpen ? "justify-center" : ""}`}
                    >
                        <LogOut className="w-4 h-4" style={{ color: "#FF6B6B" }} />
                        {(mobileOpen || !collapsed) && (
                            <span className="font-mono text-xs" style={{ color: "#FF6B6B" }}>
                                {t("nav_logout")}
                            </span>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}
