"use client";

import Link from "next/link";
import { Instagram } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export function Footer() {
    const t = useTranslations("Footer");
    const locale = useLocale();

    return (
        <footer className="border-t bg-muted/30">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 px-4">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        &copy; {new Date().getFullYear()} laKultural. {t("rights")}
                    </p>
                </div>

                <nav className="flex gap-4 sm:gap-6">
                    <Link href={`/${locale}/legal`} className="text-sm font-medium hover:underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors">
                        {t("legal")}
                    </Link>
                    <Link href="https://www.instagram.com/lakultural/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                        <Instagram className="h-4 w-4" />
                    </Link>
                </nav>
            </div>
        </footer>
    );
}

