"use client";

import { useState } from "react";
import { Album, Track } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, ShoppingCart, Disc, Download, Music, ChevronDown, Check } from "lucide-react";
import { useCart, usePlayer } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ProductDetailProps {
    album: Album;
}

export function ProductDetail({ album }: ProductDetailProps) {
    const { addAlbum, addTrack, setIsOpen } = useCart();
    const { currentTrack, isPlaying, play, pause } = usePlayer();
    const [expandedFormat, setExpandedFormat] = useState<'vinyl' | 'digital' | null>(null);

    // Translations
    // Note: ensure these keys exist in your messages/*.json or add fallback strings
    const t = useTranslations("ProductPage");

    const handlePlay = (track: Track) => {
        if (currentTrack?.id === track.id && isPlaying) {
            pause();
        } else {
            play(track, album);
        }
    };

    const toggleFormat = (format: 'vinyl' | 'digital') => {
        setExpandedFormat(prev => prev === format ? null : format);
    };

    const vinylFeatures = [
        t("vinylFeature1"),
        t("vinylFeature2"),
        t("vinylFeature3"),
    ];

    const digitalFeatures = [
        t("digitalFeature1"),
        t("digitalFeature2"),
        t("digitalFeature3"),
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left: Album Cover */}
            <div className="relative group perspective-1000">
                <div className="relative w-full aspect-square rounded-lg shadow-2xl overflow-hidden bg-muted transition-transform duration-700 ease-out group-hover:rotate-y-12">
                    {album.coverImage ? (
                        <img
                            src={album.coverImage}
                            alt={album.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
                            <Disc className="w-32 h-32 opacity-20" />
                        </div>
                    )}
                </div>
                {/* Vinyl Record sliding out */}
                <div className="absolute top-2 bottom-2 right-2 w-[95%] rounded-full bg-black -z-10 flex items-center justify-center transition-transform duration-700 ease-out group-hover:translate-x-12 lg:group-hover:translate-x-16">
                    <div className="w-1/3 h-1/3 bg-zinc-800 rounded-full border-4 border-zinc-900"></div>
                </div>
            </div>

            {/* Right: Info & Tracks */}
            <div className="flex flex-col">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-muted-foreground mb-1">{album.artist}</h2>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{album.title}</h1>
                    <div className="flex gap-2 mb-4">
                        <Badge variant="secondary">{album.genre}</Badge>
                        <Badge variant="outline">{album.releaseDate || "2024"}</Badge>
                    </div>
                </div>

                <div className="prose prose-zinc dark:prose-invert mb-8 text-muted-foreground">
                    <p>{album.description}</p>
                </div>

                {/* Purchase Options */}
                <div className="flex flex-col gap-2 mb-10 p-6 bg-secondary/20 rounded-xl border">
                    <h3 className="font-semibold text-lg mb-2">{t("purchaseOptions") || "Purchase Options"}</h3>

                    {/* Vinyl Record Row — only if price > 0 */}
                    {album.physicalPrice > 0 && (
                        <div className="rounded-lg border border-border/60 overflow-hidden transition-all">
                            <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/40 transition-colors"
                                onClick={() => toggleFormat('vinyl')}
                            >
                                <Disc className="w-5 h-5 text-foreground flex-shrink-0" />
                                <span className="font-medium flex-1">{t("vinylName") || "Vinyl Record"}</span>
                                <ChevronDown className={cn(
                                    "w-4 h-4 text-muted-foreground transition-transform duration-300",
                                    expandedFormat === 'vinyl' && "rotate-180"
                                )} />
                                <span className="font-bold text-base ml-2">{album.physicalPrice}€</span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-9 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 flex-shrink-0"
                                    onClick={(e) => { e.stopPropagation(); addAlbum(album, 'physical'); setIsOpen(true); }}
                                    title={t("addToCart")}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className={cn(
                                "overflow-hidden transition-all duration-300 ease-in-out",
                                expandedFormat === 'vinyl' ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                            )}>
                                <ul className="px-6 pb-4 pt-1 space-y-2">
                                    {vinylFeatures.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Digital Album Row — only if price > 0 */}
                    {album.digitalPrice > 0 && (
                        <div className="rounded-lg border border-border/60 overflow-hidden transition-all">
                            <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/40 transition-colors"
                                onClick={() => toggleFormat('digital')}
                            >
                                <Download className="w-5 h-5 text-foreground flex-shrink-0" />
                                <span className="font-medium flex-1">{t("digitalName") || "Digital Album"}</span>
                                <ChevronDown className={cn(
                                    "w-4 h-4 text-muted-foreground transition-transform duration-300",
                                    expandedFormat === 'digital' && "rotate-180"
                                )} />
                                <span className="font-bold text-base ml-2">{album.digitalPrice}€</span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-9 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 flex-shrink-0"
                                    onClick={(e) => { e.stopPropagation(); addAlbum(album, 'digital'); setIsOpen(true); }}
                                    title={t("addToCart")}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className={cn(
                                "overflow-hidden transition-all duration-300 ease-in-out",
                                expandedFormat === 'digital' ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                            )}>
                                <ul className="px-6 pb-4 pt-1 space-y-2">
                                    {digitalFeatures.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tracklist */}
                <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Music className="w-5 h-5" />
                        {t("tracklist") || "Tracklist"}
                    </h3>
                    <div className="space-y-2">
                        {album.tracks.map((track, index) => {
                            const isCurrent = currentTrack?.id === track.id;
                            return (
                                <div
                                    key={track.id}
                                    className={cn(
                                        "group flex items-center p-3 rounded-lg transition-colors hover:bg-secondary/50",
                                        isCurrent && "bg-secondary"
                                    )}
                                >
                                    {/* Play Button */}
                                    <button
                                        onClick={() => handlePlay(track)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all mr-4 flex-shrink-0"
                                    >
                                        {isCurrent && isPlaying ? (
                                            <Pause className="w-4 h-4" />
                                        ) : (
                                            <Play className="w-4 h-4 ml-0.5" />
                                        )}
                                    </button>
                                    {/* Track Info */}
                                    <div className="flex-1 flex items-center justify-between min-w-0">
                                        <div className="flex flex-col min-w-0 mr-4">
                                            <span className={cn(
                                                "font-medium truncate",
                                                isCurrent && isPlaying ? "text-primary" : "text-foreground"
                                            )}>
                                                {track.title}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {track.duration}
                                            </span>
                                        </div>
                                        {track.price > 0 && (
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold whitespace-nowrap">
                                                    {track.price.toFixed(2)}€
                                                </span>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-full hover:bg-primary hover:text-primary-foreground"
                                                    onClick={() => { addTrack(album, track); setIsOpen(true); }}
                                                    title={t("addToCart")}
                                                >
                                                    <ShoppingCart className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
