"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { CartButton } from "@/components/site/CartButton";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";

const LanguageSwitcher = dynamic(
    () => import("@/components/site/LanguageSwitcher").then((mod) => mod.LanguageSwitcher),
    { ssr: false }
);

import { SiteSettings } from "@/lib/siteSettings";

interface HeaderProps {
    settings?: SiteSettings | null;
}

export function Header({ settings }: HeaderProps) {
    const locale = useLocale();
    const t = useTranslations("Header");

    // Default links if not configured
    const instagramLink = settings?.social?.instagram || "https://instagram.com";
    const contactLink = settings?.social?.contact || "mailto:hola@kroma.com";

    const headerBg = "rgba(255, 255, 255, 0.9)";
    const headerFg = "#000000";

    return (
        <header
            className="sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-opacity-90 transition-colors duration-300"
            style={{
                backgroundColor: headerBg,
                color: headerFg,
                borderColor: "#000000"
            }}
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link href={`/${locale}`} className="flex items-center">
                        <Image
                            src="/kroma_lletres.png" // Consider changing to a white version/SVG if this is dark
                            alt="KROMA"
                            width={120}
                            height={40}
                            className="h-8 w-auto object-contain transition-transform duration-300 hover:rotate-12" // Removed invert to keep it dark/original
                            priority
                        />
                    </Link>
                </div>

                {/* Center: Navigation */}
                <nav className="flex items-center gap-2 md:gap-8">
                    <Link
                        href={`/${locale}/collection`}
                        className="text-sm font-medium transition-all duration-300 hover:opacity-100 opacity-90 hover:scale-110 hover:font-bold"
                        style={{ color: headerFg }}
                    >
                        {t("collection")}
                    </Link>
                    <Link
                        href={`/${locale}/events`}
                        className="text-sm font-medium transition-all duration-300 hover:opacity-100 opacity-90 hover:scale-110 hover:font-bold"
                        style={{ color: headerFg }}
                    >
                        {t("events")}
                    </Link>
                    <Link
                        href={`/${locale}/merch`}
                        className="text-sm font-medium transition-all duration-300 hover:opacity-100 opacity-90 hover:scale-110 hover:font-bold"
                        style={{ color: headerFg }}
                    >
                        {t("merch")}
                    </Link>
                </nav>


                {/* Right Side: Social & Contact */}
                <div className="flex items-center gap-2 md:gap-4 [&_button]:text-white [&_button:hover]:bg-white/10 [&_button:hover]:text-white">
                    <LanguageSwitcher />
                    <CartButton />
                    <Link
                        href={instagramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:opacity-100 opacity-80 hidden sm:block"
                        style={{ color: headerFg }}
                    >
                        <Instagram className="h-5 w-5" />
                        <span className="sr-only">Instagram</span>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="hidden md:flex hover:opacity-100 opacity-90 bg-transparent"
                        style={{
                            color: headerFg,
                            borderColor: `${headerFg}33` // 20% opacity equivalent
                        }}
                    >
                        <Link href={contactLink}>
                            {t("contact")}
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
