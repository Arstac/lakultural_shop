"use client";

import { RefreshCcw } from "lucide-react";
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
}

export function AdminHeader({ title, subtitle, onRefresh, refreshLabel = "Refresh", isRefreshing = false }: AdminHeaderProps) {
    return (
        <div
            className="sticky top-0 z-40 backdrop-blur-xl px-6 py-4 flex items-center justify-between"
            style={{
                backgroundColor: `${BG_DARK}CC`,
                borderBottom: `1px solid ${BORDER}`,
            }}
        >
            <div>
                <h1 className="text-xl font-bold font-mono tracking-tight" style={{ color: "#FFFFFF" }}>
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-xs font-mono" style={{ color: TEXT_MUTED }}>
                        {subtitle}
                    </p>
                )}
            </div>
            {onRefresh && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="font-mono"
                    style={{
                        borderColor: BORDER,
                        color: TEXT_MUTED,
                        backgroundColor: "transparent",
                    }}
                >
                    <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                    {refreshLabel}
                </Button>
            )}
        </div>
    );
}
