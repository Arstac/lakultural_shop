"use client";

import { useState, ReactNode } from "react";
import { AdminAuthProvider, useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useTranslations } from "next-intl";
import { Loader2, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ACCENT = "#CCFF00";
const BG_DARK = "#0A0A0A";
const CARD_BG = "#111111";
const BORDER = "#222222";
const TEXT_MUTED = "#888888";

function LoginGate({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading, login } = useAdminAuth();
    const t = useTranslations("Admin");
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);
        const ok = await login(pin);
        if (!ok) setError(true);
    };

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: BG_DARK }}>
            <div className="w-full max-w-sm rounded-xl p-8" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
                <div className="text-center mb-8">
                    <div
                        className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: `${ACCENT}15` }}
                    >
                        <BarChart3 className="w-8 h-8" style={{ color: ACCENT }} />
                    </div>
                    <h1 className="text-xl font-bold font-mono tracking-tight" style={{ color: "#FFFFFF" }}>
                        {t("title")}
                    </h1>
                    <p className="text-sm mt-1 font-mono" style={{ color: TEXT_MUTED }}>
                        {t("enterPin")}
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="password"
                        placeholder="PIN"
                        value={pin}
                        onChange={(e) => { setPin(e.target.value); setError(false); }}
                        className="bg-transparent border font-mono text-center text-lg tracking-[0.5em]"
                        style={{ borderColor: error ? "#FF6B6B" : BORDER, color: "#FFFFFF" }}
                    />
                    {error && (
                        <p className="text-center font-mono text-xs" style={{ color: "#FF6B6B" }}>
                            {t("invalidPin")}
                        </p>
                    )}
                    <Button
                        type="submit"
                        className="w-full font-mono font-bold tracking-wider"
                        disabled={isLoading}
                        style={{ backgroundColor: ACCENT, color: "#000000" }}
                    >
                        {isLoading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : t("access")}
                    </Button>
                </form>
            </div>
        </div>
    );
}

function AdminShell({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen" style={{ backgroundColor: BG_DARK }}>
            <AdminSidebar />
            {/* Content area — offset by sidebar width. The sidebar is 260px or 72px collapsed.
                We use ml-[72px] for both, and the sidebar overlays when expanded on mobile.
                On large screens we give full margin. */}
            <main className="flex-1 ml-[72px] lg:ml-[260px] transition-all duration-300 min-h-screen">
                {children}
            </main>
        </div>
    );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AdminAuthProvider>
            <LoginGate>
                <AdminShell>{children}</AdminShell>
            </LoginGate>
        </AdminAuthProvider>
    );
}
