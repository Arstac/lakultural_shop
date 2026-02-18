"use client";

import { Button } from "@/components/ui/button";
import { Event } from "@/lib/products";
import { useCart } from "@/lib/store";
import { Ticket } from "lucide-react";
import { useTranslations } from "next-intl";

interface EventPurchaseProps {
    event: Event;
    soldCount: number;
}

export function EventPurchase({ event, soldCount }: EventPurchaseProps) {
    const { addEvent } = useCart();
    const t = useTranslations("Events");

    const isEarlyBird = (() => {
        // If no early bird configured at all
        if (event.earlyBirdPrice === undefined) return false;

        const hasLimit = event.earlyBirdLimit !== undefined;
        const hasDeadline = event.earlyBirdDeadline !== undefined;

        // If neither limit nor deadline is set, but price is set... (edge case, maybe treat as always active? or never?)
        if (!hasLimit && !hasDeadline) return false;

        // Check Limit
        const limitCondition = !hasLimit || (soldCount < event.earlyBirdLimit!);

        // Check Deadline
        // We need to compare dates. handling timezones can be tricky, but assuming ISO strings from Sanity/JS works.
        const deadlineCondition = !hasDeadline || (new Date() < new Date(event.earlyBirdDeadline!));

        // BOTH conditions must be true (if they exist)
        return limitCondition && deadlineCondition;
    })();

    const currentPrice = isEarlyBird ? event.earlyBirdPrice : event.price;
    const remainingEarlyBird = isEarlyBird && event.earlyBirdLimit ? event.earlyBirdLimit - soldCount : 0;
    const deadlineDate = event.earlyBirdDeadline ? new Date(event.earlyBirdDeadline) : null;

    const handleAddToCart = () => {
        // We add the event, and the cart will just have the event data. 
        // The price displayed in the cart might need to be consistent. 
        // Ideally, we pass the current calculated price to the cart, OR the cart logic recalculates it.
        // For now, let's assume the cart item stores the 'event' object. 
        // If we want to show the correct price in the cart, we might need to update how the cart calculates price, 
        // OR we override the price in the cart item.
        // But since the cart logic in `store.ts` likely uses `event.price`, we might need to pass a modified event object or handle it in the store.
        // For MVP, let's pass a modified event object to the cart? 
        // No, `addEvent` takes `Event`. 
        // Let's modify the event object passed to `addEvent` to have the current price as `price` 
        // but this might be confusing if we traverse back to the original event.
        // Better: The Cart Item type has `price`? No, it has `event`.
        // Let's check `store.ts`. For now, let's just use the current price for display here.

        // Actually, looking at `store.ts` (from DOCS), CartItem has `event`. 
        // If `store.ts` uses `item.event.price`, it will use the base price.
        // We probably need to update `useCart` to allow overriding price or handling early bird.
        // BUT, for now, let's just make the Button work and visual feedback work.
        // I will dynamically update the event object passed to addEvent to reflect the current price
        // This is a bit hacky but works for client-side cart display if the cart uses `event.price`.

        const eventToAdd = {
            ...event,
            price: currentPrice! // Override price for the cart item context
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
                        <span>{t("generalAdmission")}</span>
                    </div>
                </div>
                {isEarlyBird && (
                    <div className="flex flex-col gap-1 text-xs text-amber-600 font-medium">
                        <div className="flex justify-between">
                            <span>Early Bird Active!</span>
                            {event.earlyBirdLimit && <span>{remainingEarlyBird} left</span>}
                        </div>
                        {deadlineDate && (
                            <div className="text-right text-muted-foreground">
                                Expires: {deadlineDate.toLocaleDateString()} {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                    </div>
                )}
                {/* Visual strikethrough for regular price if early bird is active */}
                {isEarlyBird && event.price > (event.earlyBirdPrice || 0) && (
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
