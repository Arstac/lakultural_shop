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

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-[#0C5752] text-white backdrop-blur supports-[backdrop-filter]:bg-[#0C5752]/90 border-white/10">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link href={`/${locale}`} className="flex items-center">
                        <Image
                            src="/kroma_lletres.png" // Consider changing to a white version/SVG if this is dark
                            alt="KROMA"
                            width={120}
                            height={40}
                            className="h-8 w-auto object-contain brightness-0 invert" // Make logo white if it's black
                            priority
                        />
                    </Link>
                </div>

                {/* Center: Navigation */}
                <nav className="flex items-center gap-2 md:gap-8">
                    <Link
                        href={`/${locale}/collection`}
                        className="text-sm font-medium text-white/90 transition-colors hover:text-white"
                    >
                        {t("collection")}
                    </Link>
                    <Link
                        href={`/${locale}/events`}
                        className="text-sm font-medium text-white/90 transition-colors hover:text-white"
                    >
                        {t("events")}
                    </Link>
                </nav>


                {/* Right Side: Social & Contact */}
                <div className="flex items-center gap-2 md:gap-4 [&_button]:text-white [&_button:hover]:bg-white/10 [&_button:hover]:text-white">
                    <LanguageSwitcher />
                    <CartButton />
                    <Link href={instagramLink} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors hidden sm:block">
                        <Instagram className="h-5 w-5" />
                        <span className="sr-only">Instagram</span>
                    </Link>
                    <Button variant="outline" size="sm" asChild className="hidden md:flex border-white/20 hover:bg-white/10 hover:text-white text-white bg-transparent">
                        <Link href={contactLink}>
                            {t("contact")}
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
