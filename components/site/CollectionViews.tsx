"use client";

import { useState } from "react";
import { Album, Track } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Disc, Music, Play, Pause, ShoppingCart } from "lucide-react";
import { useCart, usePlayer } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface CollectionViewsProps {
    albums: Album[];
    title: string;
    description: string;
    locale: string;
}

export function CollectionViews({ albums, title, description, locale }: CollectionViewsProps) {
    const [view, setView] = useState<'vinyls' | 'music'>('vinyls');
    const { addTrack, setIsOpen } = useCart();
    const { currentTrack, isPlaying, play, pause } = usePlayer();
    const t = useTranslations("Products");

    // Extract all tracks from albums for the music view
    const allTracks = albums.flatMap(album =>
        album.tracks.map(track => ({ ...track, album }))
    );

    const handlePlay = (track: Track, album: Album) => {
        if (currentTrack?.id === track.id && isPlaying) {
            pause();
        } else {
            play(track, album);
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))] py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center mb-12">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold tracking-tight mb-4">
                            {title}
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {description}
                        </p>
                    </div>

                    {/* View Selector */}
                    <div className="flex p-1 bg-muted rounded-full mb-8">
                        <button
                            onClick={() => setView('vinyls')}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2 rounded-full transition-all text-sm font-medium",
                                view === 'vinyls'
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Disc className="w-4 h-4" />
                            <span>{t("vinyls") || "Vinyls"}</span>
                        </button>
                        <button
                            onClick={() => setView('music')}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2 rounded-full transition-all text-sm font-medium",
                                view === 'music'
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Music className="w-4 h-4" />
                            <span>{t("music") || "Music"}</span>
                        </button>
                    </div>
                </div>

                {view === 'vinyls' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {albums.map((album) => (
                            <ProductCard key={album.id} album={album} locale={locale} />
                        ))}
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-2">
                        {allTracks.map((item) => {
                            const isCurrent = currentTrack?.id === item.id;

                            return (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "group flex items-center p-4 rounded-xl transition-all border border-transparent hover:border-border hover:bg-muted/30",
                                        isCurrent && "bg-muted/50 border-primary/20"
                                    )}
                                >
                                    {/* Cover Thumbnail */}
                                    <div className="relative w-12 h-12 rounded overflow-hidden mr-4 flex-shrink-0">
                                        <img
                                            src={item.album.coverImage}
                                            alt={item.album.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className={cn(
                                            "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                                            isCurrent && "opacity-100"
                                        )}>
                                            <button
                                                onClick={() => handlePlay(item, item.album)}
                                                className="text-white hover:scale-110 transition-transform"
                                            >
                                                {isCurrent && isPlaying ? (
                                                    <Pause className="w-5 h-5" />
                                                ) : (
                                                    <Play className="w-5 h-5 ml-0.5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Track Info */}
                                    <div className="flex-1 min-w-0 mr-4">
                                        <h3 className={cn(
                                            "font-medium truncate",
                                            isCurrent && isPlaying ? "text-primary" : "text-foreground"
                                        )}>
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {item.album.artist} • {item.album.title}
                                        </p>
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex items-center gap-6">
                                        <span className="text-sm text-muted-foreground hidden sm:inline-block w-12 text-right">
                                            {item.duration}
                                        </span>

                                        <div className="flex items-center gap-3 min-w-[100px] justify-end">
                                            {item.price > 0 && (
                                                <>
                                                    <span className="text-sm font-semibold">
                                                        {item.price.toFixed(2)}€
                                                    </span>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                                                        onClick={() => { addTrack(item.album, item); setIsOpen(true); }}
                                                        title={t("addToCart")}
                                                    >
                                                        <ShoppingCart className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
