"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { HomePageContent } from "@/lib/products";

interface HeroProps {
    content: HomePageContent | null;
}

export function Hero({ content }: HeroProps) {
    const t = useTranslations("Hero");

    // Use CMS content if available, otherwise fallback to translations/hardcoded
    const headline = content?.headline || t("title");
    const subheadline = content?.subheadline || t("subtitle");
    const description = content?.description || t("description");
    const ctaText = content?.ctaText || t("cta");
    const heroImage = content?.heroImage || "/hero_music.jpg";

    return (
        <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={heroImage}
                    alt="Record Store Interior"
                    className="w-full h-full object-cover brightness-[0.7]" // Darken for text readability
                />
            </div>

            <div className="relative z-10 container px-4 text-center text-white">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-md">
                    {headline}
                    <br className="hidden sm:block" />
                    <span className="text-primary-foreground/90">{subheadline}</span>
                </h1>
                <p className="mt-6 max-w-lg mx-auto text-lg sm:text-xl font-medium text-white/90 drop-shadow-sm">
                    {description}
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Button size="lg" className="text-lg px-8 py-6 rounded-full" asChild>
                        <Link href="#productos">
                            {ctaText}
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}

