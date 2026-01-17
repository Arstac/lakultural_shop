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

interface ProductDetailProps {
    product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
    const [selectedVariant, setSelectedVariant] = useState<Variant>(product.variants[0]);
    const { addItem, setIsOpen } = useCart();

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
                    productName={`${product.name} - ${selectedVariant.name}`}
                />

                <div className="mt-8 hidden md:block text-muted-foreground text-sm space-y-2">
                    <p className="font-medium text-foreground">¿Dudas con el tamaño?</p>
                    <p>• La Mini: Llaves + Tarjetero</p>
                    <p>• La Todoterreno: Móvil + Gafas + Cartera</p>
                    <p>• La Maxi: Botella 50cl + Agenda + Todo lo demás</p>
                </div>
            </div>

            {/* Right: Info & Purchase */}
            <div className="flex flex-col">
                <Badge className="w-fit mb-4" variant="outline">
                    Hecho a mano
                </Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                    {product.name}
                </h1>
                <p className="text-3xl font-medium text-primary mb-6">
                    {product.price}€
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {product.description}
                </p>

                {/* Variant Selector */}
                <div className="mb-8">
                    <h3 className="text-sm font-medium mb-3">Modelo / Color: <span className="text-muted-foreground">{selectedVariant.name}</span></h3>
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
                                {/* Circle Color Indicator (Placeholder logic) */}
                                <div className={cn(
                                    "w-4 h-4 rounded-full border",
                                    variant.name.includes("Negro") ? "bg-black" :
                                        variant.name.includes("Verde") ? "bg-[#556B2F]" :
                                            variant.name.includes("Azul") ? "bg-[#000080]" :
                                                variant.name.includes("Arena") ? "bg-[#F4A460]" :
                                                    variant.name.includes("Terracota") ? "bg-[#E2725B]" :
                                                        variant.name.includes("Camuflaje") ? "bg-[#2F4F4F]" :
                                                            "bg-gray-400"
                                )} />
                                <span className="text-sm font-medium">{variant.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <Button size="lg" className="w-full text-lg py-8 rounded-full mb-8 shadow-lg hover:shadow-xl transition-all" onClick={handleAddToCart}>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Añadir al Carrito - {product.price}€
                </Button>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="features">
                        <AccordionTrigger>Características</AccordionTrigger>
                        <AccordionContent>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {product.features.map((feature, i) => (
                                    <li key={i}>{feature}</li>
                                ))}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                    {/* ... other items same as before ... */}
                    <AccordionItem value="dimensions">
                        <AccordionTrigger>Medidas</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            {product.dimensions}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="materials">
                        <AccordionTrigger>Materiales y Cuidados</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            {product.materials}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* Mobile size guide fallback */}
                <div className="mt-8 md:hidden text-muted-foreground text-sm space-y-2 p-4 bg-muted/30 rounded-lg">
                    <p className="font-medium text-foreground">Referencia de tamaño:</p>
                    <p>• La Mini: Llaves + Tarjetero</p>
                    <p>• La Todoterreno: Móvil + Gafas + Cartera</p>
                    <p>• La Maxi: Botella 50cl + Agenda + Todo lo demás</p>
                </div>
            </div>
        </div>
    );
}
