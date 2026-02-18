"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { getMerchBySlug, Merch } from "@/lib/products";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";

interface MerchDetailPageProps {
    params: Promise<{
        slug: string;
        locale: string;
    }>;
}

export default function MerchDetailPage({ params }: MerchDetailPageProps) {
    const { slug } = use(params);
    const t = useTranslations("Merch");
    const { addMerch, setIsOpen } = useCart();

    const [merch, setMerch] = useState<Merch | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<string>("");

    useEffect(() => {
        const fetchMerch = async () => {
            const data = await getMerchBySlug(slug);
            if (!data) {
                notFound();
            }
            setMerch(data);
            if (data.sizes && data.sizes.length > 0) {
                setSelectedSize(data.sizes[0]);
            }
            setLoading(false);
        };
        fetchMerch();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!merch) return null;

    const { title, price, images, description, sizes, stock } = merch;
    const coverImage = images && images.length > 0 ? images[0] : "/placeholder-merch.jpg";
    const isOutOfStock = stock <= 0;

    const handleAddToCart = () => {
        if (sizes && sizes.length > 0 && !selectedSize) return;
        addMerch(merch, selectedSize);
        setIsOpen(true);
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                {/* Left: Image Gallery (Simplified to single image for now) */}
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
                    <Image
                        src={coverImage}
                        alt={title}
                        fill
                        className="object-cover"
                        priority
                    />
                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="destructive" className="text-lg px-4 py-2">
                                {t("outOfStock")}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Right: Details */}
                <div className="flex flex-col gap-6 md:gap-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                            {title}
                        </h1>
                        <p className="text-2xl font-medium text-primary">
                            {new Intl.NumberFormat("es-ES", {
                                style: "currency",
                                currency: "EUR",
                            }).format(price)}
                        </p>
                    </div>

                    <div className="prose prose-gray dark:prose-invert max-w-none">
                        <p>{description}</p>
                    </div>

                    <div className="space-y-4">
                        {/* Size Selector */}
                        {sizes && sizes.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {t("selectSize")}
                                </label>
                                <Select
                                    value={selectedSize}
                                    onValueChange={setSelectedSize}
                                    disabled={isOutOfStock}
                                >
                                    <SelectTrigger className="w-full md:w-[200px]">
                                        <SelectValue placeholder={t("selectSize")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sizes.map((size) => (
                                            <SelectItem key={size} value={size}>
                                                {size}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Add to Cart */}
                        <Button
                            size="lg"
                            className="w-full md:w-auto min-w-[200px]"
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                        >
                            {isOutOfStock ? t("outOfStock") : t("addToCart")}
                        </Button>
                    </div>


                </div>
            </div>
        </div>
    );
}
