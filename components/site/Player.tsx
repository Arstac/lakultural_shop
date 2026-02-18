"use client";

import { usePlayer } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

function formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function Player() {
    const { currentTrack, currentAlbum, isPlaying, pause, play, nextTrack, prevTrack, toggle } = usePlayer();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);

    useEffect(() => {
        if (currentTrack && audioRef.current) {
            audioRef.current.src = currentTrack.previewUrl;
            setCurrentTime(0);
            setDuration(0);
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

    const handleTimeUpdate = useCallback(() => {
        if (audioRef.current && !isSeeking) {
            setCurrentTime(audioRef.current.currentTime);
        }
    }, [isSeeking]);

    const handleLoadedMetadata = useCallback(() => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    }, []);

    const handleSeekStart = () => {
        setIsSeeking(true);
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentTime(parseFloat(e.target.value));
    };

    const handleSeekEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            audioRef.current.currentTime = currentTime;
        }
        setIsSeeking(false);
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (!currentTrack) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50 px-2 pt-3 pb-2 sm:px-4 sm:pt-3 sm:pb-3">
            <audio
                ref={audioRef}
                onEnded={nextTrack}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
            />

            <div className="container mx-auto flex items-center justify-between">
                {/* Track Info */}
                <div className="flex items-center gap-3 sm:gap-4 w-1/3 min-w-0">
                    {currentAlbum?.coverImage && (
                        <img
                            src={currentAlbum.coverImage}
                            alt={currentAlbum.title}
                            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded shadow-sm shrink-0"
                        />
                    )}
                    <div className="flex flex-col min-w-0">
                        <span className="font-medium leading-none text-sm sm:text-base truncate">{currentTrack.title}</span>
                        <span className="text-xs text-muted-foreground truncate">{currentAlbum?.artist}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-2 sm:gap-4 w-1/3">
                    <Button variant="ghost" size="icon" onClick={prevTrack}>
                        <SkipBack className="h-5 w-5" />
                    </Button>

                    <Button
                        size="icon"
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg"
                        onClick={toggle}
                    >
                        {isPlaying ? (
                            <Pause className="h-5 w-5 sm:h-6 sm:w-6" />
                        ) : (
                            <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-0.5" />
                        )}
                    </Button>

                    <Button variant="ghost" size="icon" onClick={nextTrack}>
                        <SkipForward className="h-5 w-5" />
                    </Button>
                </div>

                {/* Volume */}
                <div className="hidden sm:flex items-center justify-end w-1/3 gap-2">
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

            {/* Seek slider — full width on bottom */}
            <div className="container mx-auto flex items-center gap-2 mt-2">
                <span className="text-[10px] sm:text-xs tabular-nums text-muted-foreground w-8 sm:w-10 text-right shrink-0">
                    {formatTime(currentTime)}
                </span>
                <div className="relative flex-1 h-5 flex items-center group cursor-pointer">
                    {/* Background track */}
                    <div className="absolute inset-x-0 h-1 bg-secondary rounded-full" />
                    {/* Progress fill */}
                    <div
                        className="absolute left-0 h-1 bg-foreground rounded-full transition-[width] duration-75"
                        style={{ width: `${progressPercent}%` }}
                    />
                    {/* Range input overlay */}
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.1"
                        value={currentTime}
                        onMouseDown={handleSeekStart}
                        onTouchStart={handleSeekStart}
                        onChange={handleSeekChange}
                        onMouseUp={handleSeekEnd}
                        onTouchEnd={handleSeekEnd}
                        className="absolute inset-0 w-full h-5 opacity-0 cursor-pointer z-10"
                    />
                    {/* Thumb indicator */}
                    <div
                        className="absolute h-3 w-3 bg-foreground rounded-full shadow-md -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        style={{ left: `${progressPercent}%` }}
                    />
                </div>
                <span className="text-[10px] sm:text-xs tabular-nums text-muted-foreground w-8 sm:w-10 shrink-0">
                    {formatTime(duration - currentTime)}
                </span>
            </div>
        </div>
    );
}
