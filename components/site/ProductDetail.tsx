"use client";

import { Album, Track } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, ShoppingCart, Disc, Download, Music } from "lucide-react";
import { useCart, usePlayer } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ProductDetailProps {
    album: Album;
}

export function ProductDetail({ album }: ProductDetailProps) {
    const { addAlbum, addTrack, setIsOpen } = useCart();
    const { currentTrack, isPlaying, play, pause } = usePlayer();

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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
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
                <div className="absolute top-2 bottom-2 right-2 w-[95%] rounded-full bg-black -z-10 flex items-center justify-center transition-transform duration-700 ease-out group-hover:translate-x-1/3">
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
                <div className="flex flex-col gap-4 mb-10 p-6 bg-secondary/20 rounded-xl border">
                    <h3 className="font-semibold text-lg">{t("purchaseOptions") || "Purchase Options"}</h3>

                    <div className="flex gap-4 flex-wrap">
                        <Button
                            size="lg"
                            className="flex-1 min-w-[200px]"
                            onClick={() => { addAlbum(album, 'physical'); setIsOpen(true); }}
                        >
                            <Disc className="w-5 h-5 mr-2" />
                            <span>Vinyl Record</span>
                            <span className="ml-auto font-bold">{album.physicalPrice}€</span>
                        </Button>

                        <Button
                            size="lg"
                            variant="secondary"
                            className="flex-1 min-w-[200px]"
                            onClick={() => { addAlbum(album, 'digital'); setIsOpen(true); }}
                        >
                            <Download className="w-5 h-5 mr-2" />
                            <span>Digital Album</span>
                            <span className="ml-auto font-bold">{album.digitalPrice}€</span>
                        </Button>
                    </div>
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
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
