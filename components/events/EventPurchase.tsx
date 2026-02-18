"use client";

import { Button } from "@/components/ui/button";
import { Event, getActiveTier } from "@/lib/products";
import { useCart } from "@/lib/store";
import { Ticket, Tag } from "lucide-react";
import { useTranslations } from "next-intl";

interface EventPurchaseProps {
    event: Event;
    soldCount: number;
}

export function EventPurchase({ event, soldCount }: EventPurchaseProps) {
    const { addEvent } = useCart();
    const t = useTranslations("Events");

    const activeTier = getActiveTier(event.pricingTiers, soldCount);
    const currentPrice = activeTier ? activeTier.price : event.price;

    const remainingTickets = activeTier?.ticketLimit !== undefined
        ? activeTier.ticketLimit - soldCount
        : null;

    const tierEndDate = activeTier?.endDate ? new Date(activeTier.endDate) : null;

    const handleAddToCart = () => {
        const eventToAdd = {
            ...event,
            price: currentPrice!
        };
        addEvent(eventToAdd);
    };

    return (
        <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm">
            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-xl">
                        {currentPrice === 0 ? t("free") : `${currentPrice}€`}
                    </span>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Ticket className="w-4 h-4" />
                        <span>{activeTier ? activeTier.name : t("generalAdmission")}</span>
                    </div>
                </div>
                {activeTier && (
                    <div className="flex flex-col gap-1 text-xs text-amber-600 font-medium">
                        <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {activeTier.name}
                            </span>
                            {remainingTickets !== null && (
                                <span>{t("ticketsLeft", { count: remainingTickets })}</span>
                            )}
                        </div>
                        {tierEndDate && (
                            <div className="text-right text-muted-foreground">
                                {t("expiresAt", {
                                    date: `${tierEndDate.toLocaleDateString()} ${tierEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                })}
                            </div>
                        )}
                    </div>
                )}
                {/* Strikethrough base price if tier price is lower */}
                {activeTier && event.price > activeTier.price && (
                    <span className="text-sm text-muted-foreground line-through">
                        {event.price}€
                    </span>
                )}
            </div>

            <Button onClick={handleAddToCart} className="w-full transition-all duration-300 hover:scale-105 hover:opacity-90" size="lg">
                {t("addToCart")}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
                {t("secureCheckout")}
            </p>
        </div>
    );
}
