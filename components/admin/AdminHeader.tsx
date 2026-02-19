"use client";

import { RefreshCcw, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCENT = "#CCFF00";
const BG_DARK = "#0A0A0A";
const BORDER = "#222222";
const TEXT_MUTED = "#888888";

interface AdminHeaderProps {
    title: string;
    subtitle?: string;
    onRefresh?: () => void;
    refreshLabel?: string;
    isRefreshing?: boolean;
    onMenuToggle?: () => void;
}

export function AdminHeader({ title, subtitle, onRefresh, refreshLabel = "Refresh", isRefreshing = false, onMenuToggle }: AdminHeaderProps) {
    return (
        <div
            className="sticky top-0 z-40 backdrop-blur-xl px-4 lg:px-6 py-4 flex items-center justify-between gap-3"
            style={{
                backgroundColor: `${BG_DARK}CC`,
                borderBottom: `1px solid ${BORDER}`,
            }}
        >
            <div className="flex items-center gap-3 min-w-0">
                {/* Mobile hamburger */}
                {onMenuToggle && (
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-[#1a1a1a] transition-colors"
                        style={{ border: `1px solid ${BORDER}` }}
                    >
                        <Menu className="w-5 h-5" style={{ color: TEXT_MUTED }} />
                    </button>
                )}
                <div className="min-w-0">
                    <h1 className="text-lg lg:text-xl font-bold font-mono tracking-tight truncate" style={{ color: "#FFFFFF" }}>
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xs font-mono hidden sm:block" style={{ color: TEXT_MUTED }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {onRefresh && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="font-mono flex-shrink-0"
                    style={{
                        borderColor: BORDER,
                        color: TEXT_MUTED,
                        backgroundColor: "transparent",
                    }}
                >
                    <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">{refreshLabel}</span>
                </Button>
            )}
        </div>
    );
}

