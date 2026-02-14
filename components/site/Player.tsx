"use client";

import { usePlayer } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Player() {
    const { currentTrack, currentAlbum, isPlaying, pause, play, nextTrack, prevTrack, toggle } = usePlayer();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [volume, setVolume] = useState(1); // 0 to 1

    useEffect(() => {
        if (currentTrack && audioRef.current) {
            audioRef.current.src = currentTrack.previewUrl;
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Playback failed", e));
            }
        }
    }, [currentTrack]);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Playback failed", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    if (!currentTrack) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50 p-4">
            <audio
                ref={audioRef}
                onEnded={nextTrack}
            />
            <div className="container mx-auto flex items-center justify-between">

                {/* Track Info */}
                <div className="flex items-center gap-4 w-1/3">
                    {currentAlbum?.coverImage && (
                        <img
                            src={currentAlbum.coverImage}
                            alt={currentAlbum.title}
                            className="w-12 h-12 object-cover rounded shadow-sm"
                        />
                    )}
                    <div className="flex flex-col">
                        <span className="font-medium leading-none">{currentTrack.title}</span>
                        <span className="text-xs text-muted-foreground">{currentAlbum?.artist}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 w-1/3">
                    <Button variant="ghost" size="icon" onClick={prevTrack}>
                        <SkipBack className="h-5 w-5" />
                    </Button>

                    <Button
                        size="icon"
                        className="h-12 w-12 rounded-full shadow-lg"
                        onClick={toggle}
                    >
                        {isPlaying ? (
                            <Pause className="h-6 w-6" />
                        ) : (
                            <Play className="h-6 w-6 ml-1" />
                        )}
                    </Button>

                    <Button variant="ghost" size="icon" onClick={nextTrack}>
                        <SkipForward className="h-5 w-5" />
                    </Button>
                </div>

                {/* Volume & Extras (Placeholder mainly) */}
                <div className="flex items-center justify-end w-1/3 gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVolume(parseFloat(e.target.value))}
                        className="w-24 h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
}
