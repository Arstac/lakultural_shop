"use client";

import { HandMetal, Droplets, Truck } from "lucide-react";
import { useTranslations } from "next-intl";

export function ValueProps() {
    const t = useTranslations("ValueProps");

    return (
        <section className="py-16 bg-muted/50">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-4 rounded-full bg-primary/10 text-primary">
                            <HandMetal className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold">{t("handmade.title")}</h3>
                        <p className="text-muted-foreground">
                            {t("handmade.description")}
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-4 rounded-full bg-primary/10 text-primary">
                            <Droplets className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold">{t("waterproof.title")}</h3>
                        <p className="text-muted-foreground">
                            {t("waterproof.description")}
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-4 rounded-full bg-primary/10 text-primary">
                            <Truck className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold">{t("shipping.title")}</h3>
                        <p className="text-muted-foreground">
                            {t("shipping.description")}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

