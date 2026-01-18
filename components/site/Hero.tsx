"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function Hero() {
    const t = useTranslations("Hero");

    return (
        <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('/IMG_6031.JPG')",
                    filter: "brightness(0.7)"
                }}
            />

            <div className="relative z-10 container px-4 text-center text-white">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-md">
                    {t("title")}
                    <br className="hidden sm:block" />
                    <span className="text-primary-foreground/90">{t("subtitle")}</span>
                </h1>
                <p className="mt-6 max-w-lg mx-auto text-lg sm:text-xl font-medium text-white/90 drop-shadow-sm">
                    {t("description")}
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Button size="lg" className="text-lg px-8 py-6 rounded-full" asChild>
                        <Link href="#productos">
                            {t("cta")}
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}

