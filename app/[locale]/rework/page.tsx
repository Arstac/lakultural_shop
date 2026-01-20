"use client";

import { ProductCard } from "@/components/site/ProductCard";
import { products } from "@/lib/products";
import { useTranslations } from "next-intl";

export default function ReworkPage() {
    const t = useTranslations("ReworkPage");

    return (
        <div className="container mx-auto px-4 py-20 min-h-[calc(100vh-theme(spacing.16))]">
            <div className="text-center mb-16 mt-10">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                    {t("title")}
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    {t("description")}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {products
                    .filter((p) => p.category === "rework")
                    .map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
            </div>
        </div>
    );
}
