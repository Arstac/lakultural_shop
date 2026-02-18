const ACCENT = "#CCFF00";
const CARD_BG = "#111111";
const BORDER = "#222222";
const TEXT_MUTED = "#888888";

export function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, { bg: string; text: string }> = {
        paid: { bg: "#CCFF0020", text: ACCENT },
        shipped: { bg: "#00FFAA20", text: "#00FFAA" },
        pending: { bg: "#FFB86B20", text: "#FFB86B" },
        cancelled: { bg: "#FF6B6B20", text: "#FF6B6B" },
        active: { bg: "#CCFF0020", text: ACCENT },
        used: { bg: "#6B8AFF20", text: "#6B8AFF" },
    };
    const c = colors[status] || colors.pending;
    return (
        <span
            className="px-2 py-0.5 rounded-full text-xs font-mono uppercase tracking-wider"
            style={{ backgroundColor: c.bg, color: c.text }}
        >
            {status}
        </span>
    );
}

export function KpiCard({
    title,
    value,
    icon: Icon,
    accent = false,
}: {
    title: string;
    value: string | number;
    icon: any;
    accent?: boolean;
}) {
    return (
        <div
            className="relative overflow-hidden rounded-lg p-5 transition-all duration-300 hover:scale-[1.02]"
            style={{
                backgroundColor: CARD_BG,
                border: `1px solid ${accent ? ACCENT : BORDER}`,
            }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: TEXT_MUTED }}>
                        {title}
                    </p>
                    <p className="text-2xl font-bold font-mono" style={{ color: accent ? ACCENT : "#FFFFFF" }}>
                        {value}
                    </p>
                </div>
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: accent ? `${ACCENT}20` : BORDER }}
                >
                    <Icon className="w-5 h-5" style={{ color: accent ? ACCENT : TEXT_MUTED }} />
                </div>
            </div>
            {accent && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: ACCENT }} />
            )}
        </div>
    );
}

export function SearchBar({
    value,
    onChange,
    placeholder = "Search...",
    children,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    children?: React.ReactNode;
}) {
    return (
        <div
            className="flex items-center gap-3 p-3 rounded-lg flex-wrap"
            style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}
        >
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 min-w-[200px] bg-transparent font-mono text-sm outline-none"
                style={{ color: "#FFFFFF" }}
            />
            {children}
        </div>
    );
}

export function ExportCSV({ data, filename = "export" }: { data: Record<string, any>[]; filename?: string }) {
    const handleExport = () => {
        if (!data.length) return;
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(","),
            ...data.map((row) =>
                headers
                    .map((h) => {
                        const val = row[h];
                        const str = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
                        return `"${str.replace(/"/g, '""')}"`;
                    })
                    .join(",")
            ),
        ];
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-lg font-mono text-xs transition-colors hover:opacity-80"
            style={{
                backgroundColor: `${ACCENT}15`,
                color: ACCENT,
                border: `1px solid ${ACCENT}40`,
            }}
        >
            ↓ CSV
        </button>
    );
}

export function FilterButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all duration-200"
            style={{
                backgroundColor: active ? `${ACCENT}20` : "transparent",
                color: active ? ACCENT : TEXT_MUTED,
                border: `1px solid ${active ? ACCENT : BORDER}`,
            }}
        >
            {children}
        </button>
    );
}

export function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center py-16">
            <p className="font-mono text-sm" style={{ color: TEXT_MUTED }}>
                {message}
            </p>
        </div>
    );
}
