"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { ValueProps } from "@/components/site/ValueProps";
import { HomePageContent, Album } from "@/lib/products";

interface ParallaxHomeProps {
    homeContent: HomePageContent | null;
    albums: Album[];
    locale: string;
    translations: {
        title: string;
        description: string;
        cta: string;
        collectionTitle: string;
        collectionDesc: string;
    };
    eventBannerSlot: React.ReactNode;
}

export function ParallaxHome({
    homeContent,
    albums,
    locale,
    translations,
    eventBannerSlot,
}: ParallaxHomeProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Hero Animations
    const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);

    // Title Animation: Enters from bottom, centers, then stays or fades
    const titleY = useTransform(scrollYProgress, [0, 0.3], ["50vh", "0vh"]);
    const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

    // Use CMS content or fallbacks
    const headline = homeContent?.headline || translations.title;
    const subheadline = homeContent?.subheadline || translations.description;
    const heroImage = homeContent?.heroImage || "/background_kultural.jpeg";
    const titleImage = homeContent?.titleImage || "/kultural.svg";

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Spacer to allow scrolling before content covers hero */}
            <div className="h-[100vh] w-full" />

            {/* Sticky Hero Section */}
            <div className="fixed top-0 left-0 h-screen w-full -z-10 overflow-hidden">
                {/* Background Image */}
                <motion.div
                    style={{ scale: heroScale }}
                    className="absolute inset-0 z-0"
                >
                    <div className="absolute inset-0 bg-black/30 z-10" />
                    <img
                        src={heroImage}
                        alt="Hero Background"
                        className="w-full h-full object-cover"
                    />
                </motion.div>

                {/* Hero Content */}
                <motion.div
                    style={{ y: titleY, opacity: titleOpacity }}
                    className="relative z-20 h-full flex flex-col items-center justify-center text-center text-white p-4"
                >
                    {/* Title Image */}
                    <div className="mb-8 w-full max-w-[800px] px-4">
                        <img
                            src={titleImage}
                            alt={headline}
                            className="w-full h-auto drop-shadow-2xl"
                        />
                    </div>

                    <p className="text-xl md:text-3xl font-light tracking-widest max-w-3xl drop-shadow-lg bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                        {subheadline}
                    </p>
                </motion.div>
            </div>

            {/* Scrolling Content Layer */}
            {/* Pushing content down so we scroll "passed" the hero interactions first */}
            <div className="relative z-30 mt-[100vh] bg-background min-h-screen shadow-[0_-20px_50px_rgba(0,0,0,0.5)] rounded-t-3xl border-t border-white/10">
                <div className="container mx-auto px-4 py-20">
                    {/* Events Section Slot */}
                    <div className="mb-20">
                        {eventBannerSlot}
                    </div>

                    {/* Products Section */}
                    <section id="productos" className="py-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                                {translations.collectionTitle}
                            </h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                {translations.collectionDesc}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {albums.map((album) => (
                                <ProductCard key={album.id} album={album} locale={locale} />
                            ))}
                        </div>
                    </section>

                    {/* Value Props */}
                    <ValueProps />
                </div>
            </div>
        </div>
    );
}
