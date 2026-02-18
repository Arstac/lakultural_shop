"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { ValueProps } from "@/components/site/ValueProps";
import { HomePageContent, Album } from "@/lib/products";
import { cn } from "@/lib/utils";

import { CountdownBanner } from "@/components/site/CountdownBanner";
import { Event } from "@/lib/products";

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
    nextEvent: Event | null;
    primaryColor: string;
}

export function ParallaxHome({
    homeContent,
    albums,
    locale,
    translations,
    eventBannerSlot,
    nextEvent,
    primaryColor,
}: ParallaxHomeProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // -- Parallax Transforms --
    // Background moves slowly (0.5 speed)
    const backgroundY = useTransform(scrollY, [0, 1000], [0, 500]);

    // Text moves slightly faster than background but slower than scroll (0.8 speed) 
    // and fades out quickly to allow content to be read
    const textY = useTransform(scrollY, [0, 500], [0, 400]);
    const textOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const textBlur = useTransform(scrollY, [0, 300], ["0px", "10px"]);

    // Floating Vinyl/Element moves and rotates
    const vinylY = useTransform(scrollY, [0, 1000], [0, -200]);
    const vinylRotate = useTransform(scrollY, [0, 1000], [0, 180]);
    const vinylOpacity = useTransform(scrollY, [0, 400], [0.8, 0]);

    // Banner visibility: Slide up when scrolled past 100px
    const bannerY = useTransform(scrollY, [0, 200], [100, 0]); // Moves from 100px down to 0px
    const bannerOpacity = useTransform(scrollY, [0, 200], [0, 1]);

    // Use CMS content or fallbacks
    const headline = homeContent?.headline || translations.title;
    const subheadline = homeContent?.subheadline || translations.description;
    const heroImage = homeContent?.heroImage || "/background_kultural.jpeg";
    const titleImage = homeContent?.titleImage || "/kultural.svg";

    return (
        <div ref={containerRef} className="relative w-full overflow-hidden bg-background">

            {/* Sticky Countdown Banner */}
            {nextEvent && (
                <motion.div
                    style={{ y: bannerY, opacity: bannerOpacity }}
                    className="fixed top-20 left-0 right-0 z-50 pointer-events-auto"
                >
                    <CountdownBanner event={nextEvent} locale={locale} primaryColor={primaryColor} />
                </motion.div>
            )}

            {/* -- HERO SECTION (Fixed/Parallax) -- */}
            <div className="relative h-[110vh] w-full overflow-hidden">
                {/* Layer 1: Background Image */}
                <motion.div
                    style={{ y: backgroundY }}
                    className="absolute inset-0 z-0"
                >
                    <div className="absolute inset-0 bg-black/40 z-10" />
                    <img
                        src={heroImage}
                        alt="Hero Background"
                        className="w-full h-full object-cover scale-110" // Initial scale to allow movement
                    />
                </motion.div>

                {/* Layer 1.5: Floating Elements (Optional Visual Flair) */}
                <motion.div
                    style={{ y: vinylY, rotate: vinylRotate, opacity: vinylOpacity }}
                    className="absolute top-1/4 right-[10%] w-64 h-64 md:w-96 md:h-96 rounded-full border-2 border-white/10 blur-[1px] -z-5 hidden lg:block pointer-events-none"
                >
                    {/* Abstract Vinyl Shape */}
                    <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-md relative">
                        <div className="absolute inset-[45%] bg-white/10 rounded-full" />
                    </div>
                </motion.div>

                {/* Layer 2: Main Text Content */}
                <motion.div
                    style={{ y: textY, opacity: textOpacity, filter: `blur(${textBlur})` }} // Added dynamic blur manually via style string if motion supports it, otherwise class
                    className="relative z-20 h-screen flex flex-col items-center justify-center text-center text-white p-4 pb-32"
                >
                    {/* Title Image */}
                    <div className="mb-8 w-full max-w-[600px] md:max-w-[800px] px-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="w-full h-auto"
                        >
                            <img
                                src={titleImage}
                                alt={headline}
                                className="w-full h-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] max-w-full"
                            />
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <p className="text-xl md:text-2xl font-light tracking-[0.2em] max-w-3xl drop-shadow-lg text-white/90">
                            {subheadline}
                        </p>
                    </motion.div>
                </motion.div>
            </div>

            {/* -- CONTENT LAYERS (Background moves up to cover hero smoothly) -- */}
            <div className="relative z-30 -mt-[15vh]">

                <div className="bg-background min-h-screen relative pb-20 pt-20 rounded-t-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.2)]">
                    <div className="container mx-auto px-4">

                        {/* Event Banner - Slightly overlapping into the hero space for depth */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="relative z-40 -mt-10 mb-20"
                        >
                            {eventBannerSlot}
                        </motion.div>

                        {/* Products Section */}
                        <section id="productos" className="py-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="text-center mb-16"
                            >
                                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-foreground">
                                    {translations.collectionTitle}
                                </h2>
                                <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
                                    {translations.collectionDesc}
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                                {albums.map((album, index) => (
                                    <motion.div
                                        key={album.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                    >
                                        <ProductCard album={album} locale={locale} />
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* Value Props */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="mt-20 border-t pt-20"
                        >
                            <ValueProps />
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
