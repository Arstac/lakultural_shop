"use client";

import { useCart } from "@/lib/store";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, Disc, Download, Music } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

export function CartSheet() {
    const { items, removeItem, updateQuantity, isOpen, setIsOpen } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const t = useTranslations("Cart");

    const total = items.reduce(
        (acc, item) => {
            let price = 0;
            if (item.type === 'album_physical') price = item.album.physicalPrice;
            else if (item.type === 'album_digital') price = item.album.digitalPrice;
            else if (item.type === 'track' && item.track) price = item.track.price;
            return acc + price * item.quantity;
        },
        0
    );

    const handleCheckout = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });
            const data = await response.json();
            if (data.url) router.push(data.url);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getItemName = (item: any) => {
        if (item.type === 'track' && item.track) return item.track.title;
        return item.album.title;
    };

    const getItemDetail = (item: any) => {
        if (item.type === 'track') return `Single - ${item.album.artist}`;
        if (item.type === 'album_physical') return `Vinyl Record`;
        if (item.type === 'album_digital') return `Digital Album`;
        return "";
    };

    const getItemPrice = (item: any) => {
        if (item.type === 'album_physical') return item.album.physicalPrice;
        if (item.type === 'album_digital') return item.album.digitalPrice;
        if (item.type === 'track' && item.track) return item.track.price;
        return 0;
    };

    const getItemIcon = (type: string) => {
        if (type === 'album_physical') return <Disc className="w-4 h-4" />;
        if (type === 'album_digital') return <Download className="w-4 h-4" />;
        return <Music className="w-4 h-4" />;
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="flex flex-col w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t("title") || "Cart"} ({items.length})</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                            <ShoppingBag className="w-12 h-12 opacity-20" />
                            <p>{t("empty") || "Your cart is empty"}</p>
                            <Button variant="link" onClick={() => setIsOpen(false)}>
                                {t("viewCollection") || "Start shopping"}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6 px-1">
                            {items.map((item) => {
                                // Safety check: if album data is missing (e.g. stale cart), skip rendering to avoid crash
                                if (!item.album) {
                                    return null;
                                }

                                return (
                                    <div key={item.cartId} className="flex gap-4">
                                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0 flex items-center justify-center border">
                                            {item.album.coverImage ? (
                                                <img src={item.album.coverImage} className="w-full h-full object-cover" />
                                            ) : (
                                                getItemIcon(item.type)
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <Link
                                                    href={`/producto/${item.album.slug}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="font-semibold text-sm line-clamp-1 hover:underline hover:text-primary transition-colors"
                                                >
                                                    {getItemName(item)}
                                                </Link>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    {getItemIcon(item.type)}
                                                    {getItemDetail(item)}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </Button>
                                                    <span className="text-sm w-4 text-center">{item.quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                    onClick={() => removeItem(item.cartId)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-between items-end">
                                            <span className="font-medium text-sm">
                                                {(getItemPrice(item) * item.quantity).toFixed(2)}€
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <SheetFooter className="border-t pt-6">
                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>{t("total") || "Total"}</span>
                                <span>{total.toFixed(2)}€</span>
                            </div>
                            <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isLoading}>
                                {isLoading ? (t("processing") || "Processing...") : (t("checkout") || "Checkout")}
                            </Button>
                        </div>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
