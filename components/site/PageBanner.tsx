"use client";

interface PageBannerProps {
    title: string;
    subtitle?: string;
    primaryColor: string;
}

export function PageBanner({ title, subtitle, primaryColor }: PageBannerProps) {
    return (
        <div
            className="mt-6 text-black border-black py-4 px-6 flex flex-col items-center justify-center gap-2 shadow-[0_4px_0px_rgba(0,0,0,1)] mb-10 transition-colors duration-300 cursor-default"
            style={{ backgroundColor: primaryColor }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#000';
                e.currentTarget.style.color = primaryColor;
                const badge = e.currentTarget.querySelector<HTMLSpanElement>('[data-banner-badge]');
                if (badge) {
                    badge.style.backgroundColor = primaryColor;
                    badge.style.color = '#000';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = primaryColor;
                e.currentTarget.style.color = '#000';
                const badge = e.currentTarget.querySelector<HTMLSpanElement>('[data-banner-badge]');
                if (badge) {
                    badge.style.backgroundColor = '#000';
                    badge.style.color = primaryColor;
                }
            }}
        >
            <h1 className="font-mono font-bold text-2xl md:text-4xl uppercase tracking-widest text-center">
                {title}
            </h1>
            {subtitle && (
                <span
                    data-banner-badge
                    className="uppercase font-bold tracking-widest text-xs md:text-sm bg-black px-3 py-1 rounded-sm transition-colors duration-300"
                    style={{ color: primaryColor }}
                >
                    {subtitle}
                </span>
            )}
        </div>
    );
}
