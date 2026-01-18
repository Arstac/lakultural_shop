"use client";

import { Product, Variant } from "@/lib/products";
import { useState } from "react";
import { ProductGallery } from "./ProductGallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, ShoppingCart } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useCart } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ProductDetailProps {
    product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
    const [selectedVariant, setSelectedVariant] = useState<Variant>(product.variants[0]);
    const { addItem, setIsOpen } = useCart();

    // Translations
    const t = useTranslations("ProductPage");
    const tProduct = useTranslations("ProductData");

    // Get translated product content
    const productName = tProduct(`${product.slug}.name`);
    const productDescription = tProduct(`${product.slug}.description`);
    const productMaterials = tProduct(`${product.slug}.materials`);

    // Get translated variant name
    const getVariantName = (variantId: string) => {
        return tProduct(`variants.${variantId}`);
    };

    const handleAddToCart = () => {
        addItem(product, selectedVariant);
        setIsOpen(true);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            {/* Left: Gallery - Updates with variant image */}
            <div>
                <ProductGallery
                    images={[selectedVariant.image, ...product.images]}
                    productName={`${productName} - ${getVariantName(selectedVariant.id)}`}
                />

                <div className="mt-8 hidden md:block text-muted-foreground text-sm space-y-2">
                    <p className="font-medium text-foreground">{tProduct("sizeGuide.title")}</p>
                    <p>• {tProduct("sizeGuide.mini")}</p>
                    <p>• {tProduct("sizeGuide.todoterreno")}</p>
                    <p>• {tProduct("sizeGuide.maxi")}</p>
                </div>
            </div>

            {/* Right: Info & Purchase */}
            <div className="flex flex-col">
                <Badge className="w-fit mb-4" variant="outline">
                    {t("handmade")}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                    {productName}
                </h1>
                <p className="text-3xl font-medium text-primary mb-6">
                    {product.price}€
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {productDescription}
                </p>

                {/* Variant Selector */}
                <div className="mb-8">
                    <h3 className="text-sm font-medium mb-3">{t("modelColor")}: <span className="text-muted-foreground">{getVariantName(selectedVariant.id)}</span></h3>
                    <div className="flex flex-wrap gap-3">
                        {product.variants.map((variant) => (
                            <button
                                key={variant.id}
                                onClick={() => setSelectedVariant(variant)}
                                className={cn(
                                    "group relative flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
                                    selectedVariant.id === variant.id
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "border-input hover:border-primary/50"
                                )}
                            >
                                {/* Circle Color Indicator */}
                                <div className={cn(
                                    "w-4 h-4 rounded-full border",
                                    variant.id.includes("black") ? "bg-black" :
                                        variant.id.includes("olive") ? "bg-[#556B2F]" :
                                            variant.id.includes("navy") ? "bg-[#000080]" :
                                                variant.id.includes("sand") ? "bg-[#F4A460]" :
                                                    variant.id.includes("terracotta") ? "bg-[#E2725B]" :
                                                        variant.id.includes("camo") ? "bg-[#2F4F4F]" :
                                                            "bg-gray-400"
                                )} />
                                <span className="text-sm font-medium">{getVariantName(variant.id)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <Button size="lg" className="w-full text-lg py-8 rounded-full mb-8 shadow-lg hover:shadow-xl transition-all" onClick={handleAddToCart}>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {t("addToCart")} - {product.price}€
                </Button>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="features">
                        <AccordionTrigger>{t("features")}</AccordionTrigger>
                        <AccordionContent>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {[0, 1, 2].map((i) => (
                                    <li key={i}>{tProduct(`${product.slug}.features.${i}`)}</li>
                                ))}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="dimensions">
                        <AccordionTrigger>{t("dimensions")}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            {product.dimensions}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="materials">
                        <AccordionTrigger>{t("materials")}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            {productMaterials}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* Mobile size guide fallback */}
                <div className="mt-8 md:hidden text-muted-foreground text-sm space-y-2 p-4 bg-muted/30 rounded-lg">
                    <p className="font-medium text-foreground">{t("sizeReference")}:</p>
                    <p>• {tProduct("sizeGuide.mini")}</p>
                    <p>• {tProduct("sizeGuide.todoterreno")}</p>
                    <p>• {tProduct("sizeGuide.maxi")}</p>
                </div>
            </div>
        </div>
    );
}

