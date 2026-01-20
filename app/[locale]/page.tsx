"use client";

import { Hero } from "@/components/site/Hero";
import { ProductCard } from "@/components/site/ProductCard";
import { ValueProps } from "@/components/site/ValueProps";
import { ReworkTeaser } from "@/components/site/ReworkTeaser";
import { products } from "@/lib/products";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Products");
  const reworkProducts = products.filter(p => p.category === "rework");

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))]">
      <Hero />

      <section id="productos" className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {t("title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products
            .filter((p) => p.category === "standard")
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </section>

      <ReworkTeaser products={reworkProducts} />

      <ValueProps />
    </div>
  );
}

