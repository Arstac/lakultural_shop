"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Event } from "@/lib/products";
import { cn } from "@/lib/utils";

interface CountdownBannerProps {
    event: Event;
    locale: string;
    primaryColor: string;
}

export function CountdownBanner({ event, locale, primaryColor }: CountdownBannerProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(event.date) - +new Date();

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return null;
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [event.date]);

    if (!timeLeft) return null;

    return (
        <Link href={`/${locale}/events/${event.slug}`}>
            <div
                className="w-full text-black border-b-2 border-black py-2 px-4 cursor-pointer transition-colors duration-300 flex items-center justify-between gap-4 shadow-[0_4px_0px_rgba(0,0,0,1)] group"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#000';
                    e.currentTarget.style.color = primaryColor;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = primaryColor;
                    e.currentTarget.style.color = '#000';
                }}
            >

                {/* Event Name & Label */}
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 overflow-hidden">
                    <span className="uppercase font-bold tracking-widest text-xs md:text-sm bg-black px-2 py-0.5 rounded-sm whitespace-nowrap" style={{ color: primaryColor }}>
                        Next Event
                    </span>
                    <span className="font-mono font-bold text-sm md:text-base truncate max-w-[150px] md:max-w-xs">
                        {event.title}
                    </span>
                </div>

                {/* Countdown */}
                <div className="flex items-center gap-2 font-mono text-sm md:text-lg font-bold tracking-tighter">
                    <div className="flex flex-col items-center">
                        <span>{String(timeLeft.days).padStart(2, '0')}</span>
                        <span className="text-[0.5rem] uppercase -mt-1 opacity-80">Days</span>
                    </div>
                    <span>:</span>
                    <div className="flex flex-col items-center">
                        <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                        <span className="text-[0.5rem] uppercase -mt-1 opacity-80">Hrs</span>
                    </div>
                    <span>:</span>
                    <div className="flex flex-col items-center">
                        <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                        <span className="text-[0.5rem] uppercase -mt-1 opacity-80">Min</span>
                    </div>
                    <span>:</span>
                    <div className="flex flex-col items-center">
                        <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                        <span className="text-[0.5rem] uppercase -mt-1 opacity-80">Sec</span>
                    </div>
                </div>

                {/* CTA Icon (Mobile Hidden maybe?) */}
                <div className="hidden md:block">
                    →
                </div>
            </div>
        </Link>
    );
}
