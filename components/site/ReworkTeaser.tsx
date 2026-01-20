"use client";

import { Button } from "@/components/ui/button";
import { Product } from "@/lib/products";
import { ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";

interface ReworkTeaserProps {
    products: Product[];
}

export function ReworkTeaser({ products }: ReworkTeaserProps) {
    const t = useTranslations("ReworkPage");
    const locale = useLocale();
    const featuredProduct = products[0];

    if (!featuredProduct) return null;

    return (
        <section className="bg-zinc-900 text-white py-24 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full opacity-30 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">

                    {/* Content */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <span className="text-primary font-medium tracking-widest text-sm uppercase mb-3 block">
                                Limited Edition
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                                {t("title")}
                            </h2>
                            <p className="text-xl md:text-2xl text-zinc-400 font-light leading-relaxed max-w-xl">
                                {t("description")}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                size="lg"
                                className="bg-white text-black hover:bg-zinc-200 text-lg px-8 h-14 rounded-full"
                                asChild
                            >
                                <Link href={`/${locale}/rework`}>
                                    Explorar Rework <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="flex-1 w-full max-w-lg lg:max-w-xl relative">
                        <div className="aspect-square relative rounded-2xl overflow-hidden shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-700 ease-out">
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent z-10" />

                            <Image
                                src={featuredProduct.images[0]}
                                alt={featuredProduct.name}
                                fill
                                className="object-cover transition-transform duration-700 hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
