"use client";

import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/store";
import { useEffect, useState } from "react";

interface CartButtonProps {
    primaryColor?: string;
}

export function CartButton({ primaryColor }: CartButtonProps) {
    const { items, setIsOpen } = useCart();
    const [mounted, setMounted] = useState(false);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
            </Button>
        )
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative transition-colors duration-300 hover:bg-transparent"
            style={{ color: hovered && primaryColor ? primaryColor : undefined }}
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <ShoppingBag className="h-5 w-5" />
            {items.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center animate-in zoom-in">
                    {items.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
            )}
        </Button>
    );
}
