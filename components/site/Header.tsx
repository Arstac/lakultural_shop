"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { CartButton } from "@/components/site/CartButton";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

export function Header() {
    const locale = useLocale();
    const t = useTranslations("Header");

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link href={`/${locale}`} className="flex items-center">
                        <Image
                            src="/kroma_lletres.png"
                            alt="KROMA"
                            width={120}
                            height={40}
                            className="h-8 w-auto object-contain"
                            priority
                        />
                    </Link>
                </div>


                {/* Right Side: Social & Contact */}
                <div className="flex items-center gap-2 md:gap-4">
                    <LanguageSwitcher />
                    <CartButton />
                    <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                        <Instagram className="h-5 w-5" />
                        <span className="sr-only">Instagram</span>
                    </Link>
                    <Button variant="outline" size="sm" asChild className="hidden md:flex">
                        <Link href="mailto:hola@kroma.com">
                            {t("contact")}
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
