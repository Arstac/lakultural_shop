'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function GridBackground() {
    const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isVisible) setIsVisible(true);

            // Grid cell size
            const cellSize = 40;

            // Calculate grid cell position
            const x = Math.floor(e.clientX / cellSize) * cellSize;
            const y = Math.floor(e.clientY / cellSize) * cellSize;

            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isVisible]);

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden" aria-hidden="true">
            {/* Grid Pattern */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #E5E5E5 1px, transparent 1px),
                        linear-gradient(to bottom, #E5E5E5 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Illuminated Cell */}
            {isVisible && (
                <motion.div
                    className="absolute w-[40px] h-[40px] bg-primary/40"
                    animate={{
                        x: mousePos.x,
                        y: mousePos.y
                    }}
                    transition={{
                        type: "tween",
                        ease: "circOut",
                        duration: 0.1
                    }}
                    initial={{ x: -100, y: -100 }}
                />
            )}
        </div>
    );
}
