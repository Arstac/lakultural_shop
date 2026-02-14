"use client";

import { Disc, Mic2, PackageCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export function ValueProps() {
    const t = useTranslations("ValueProps");

    const props = [
        {
            icon: Disc,
            key: "handmade", // Mapped to "180g Vinyl"
        },
        {
            icon: Mic2,
            key: "waterproof", // Mapped to "Exclusive Art"
        },
        {
            icon: PackageCheck,
            key: "shipping", // Mapped to "Safe Shipping"
        },
    ];

    return (
        <section className="py-16 bg-muted/50">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {props.map((item) => (
                        <div key={item.key} className="flex flex-col items-center gap-4 p-6 rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 rounded-full bg-primary/10 text-primary">
                                <item.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold">{t(`${item.key}.title`)}</h3>
                            <p className="text-muted-foreground text-center">
                                {t(`${item.key}.description`)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
