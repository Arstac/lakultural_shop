"use client";

import { Button } from "@/components/ui/button";
import { Event } from "@/lib/products";
import { useCart } from "@/lib/store";
import { Ticket } from "lucide-react";
import { useTranslations } from "next-intl";

interface EventPurchaseProps {
    event: Event;
}

export function EventPurchase({ event }: EventPurchaseProps) {
    const { addEvent } = useCart();
    const t = useTranslations("Events");

    const handleAddToCart = () => {
        addEvent(event);
    };

    return (
        <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">
                    {event.price === 0 ? t("free") : `${event.price}€`}
                </span>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Ticket className="w-4 h-4" />
                    <span>{t("generalAdmission")}</span>
                </div>
            </div>

            <Button onClick={handleAddToCart} className="w-full" size="lg">
                {t("addToCart")}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
                {t("secureCheckout")}
            </p>
        </div>
    );
}
