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
import { Minus, Plus, Trash2, ShoppingBag, Disc, Download, Music, Ticket, Shirt } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export function CartSheet() {
    const { items, removeItem, updateQuantity, isOpen, setIsOpen, clearCart } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const [isFreeCheckoutOpen, setIsFreeCheckoutOpen] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");


    const router = useRouter();
    const t = useTranslations("Cart");
    const locale = useLocale();

    const total = items.reduce(
        (acc, item) => {
            let price = 0;
            if (item.type === 'album_physical' && item.album) price = item.album.physicalPrice;
            else if (item.type === 'album_digital' && item.album) price = item.album.digitalPrice;
            else if (item.type === 'track' && item.track) price = item.track.price;
            else if (item.type === 'event' && item.event) price = item.event.price;
            else if (item.type === 'merch' && item.merch) price = item.merch.price;
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
                body: JSON.stringify({ items, locale }),
            });
            const data = await response.json();
            if (data.url) router.push(data.url);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };



    const handleFreeCheckout = async () => {
        if (!customerName || !customerEmail) {
            alert(t("fillRequiredFields") || "Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/checkout/free", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items,
                    customerName,
                    customerEmail,
                    locale
                }),
            });

            const data = await response.json();

            if (data.success && data.orderId) {
                clearCart();
                setIsOpen(false);
                setIsFreeCheckoutOpen(false);
                router.push(`/${locale}/success?order_id=${data.orderId}`);
            } else {
                alert(t("orderError") || "Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert(t("orderError") || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getItemName = (item: any) => {
        if (item.type === 'track' && item.track) return item.track.title;
        if (item.type === 'event' && item.event) return item.event.title;
        if (item.type === 'merch' && item.merch) return item.merch.title;
        if (item.album) return item.album.title;
        return "Unknown Item";
    };

    const getItemDetail = (item: any) => {
        if (item.type === 'track' && item.album) return `Single - ${item.album.artist}`;
        if (item.type === 'album_physical') return `Vinyl Record`;
        if (item.type === 'album_digital') return `Digital Album`;
        if (item.type === 'event' && item.event) return `Event Ticket - ${new Date(item.event.date).toLocaleDateString()}`;
        if (item.type === 'merch' && item.merch) return item.size ? `Size: ${item.size}` : `Merch`;
        return "";
    };

    const getItemPrice = (item: any) => {
        if (item.type === 'album_physical' && item.album) return item.album.physicalPrice;
        if (item.type === 'album_digital' && item.album) return item.album.digitalPrice;
        if (item.type === 'track' && item.track) return item.track.price;
        if (item.type === 'track' && item.track) return item.track.price;
        if (item.type === 'event' && item.event) return item.event.price;
        if (item.type === 'merch' && item.merch) return item.merch.price;
        return 0;
    };

    const getItemIcon = (type: string) => {
        if (type === 'album_physical') return <Disc className="w-4 h-4" />;
        if (type === 'album_digital') return <Download className="w-4 h-4" />;
        if (type === 'event') return <Ticket className="w-4 h-4" />;
        if (type === 'merch') return <Shirt className="w-4 h-4" />;
        return <Music className="w-4 h-4" />;
    };

    const getItemImage = (item: any) => {
        if (item.type === 'event' && item.event) return item.event.image;
        if (item.type === 'merch' && item.merch && item.merch.images.length > 0) return item.merch.images[0];
        if (item.album) return item.album.coverImage;
        return null;
    }

    const getItemLink = (item: any) => {
        if (item.type === 'event' && item.event) return `/tickets/${item.event.slug}`;
        if (item.type === 'merch' && item.merch) return `/merch/${item.merch.slug}`;
        if (item.album) return `/producto/${item.album.slug}`;
        return "#";
    }





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
                                // Safety check
                                if (!item.album && !item.event && !item.merch) {
                                    return null;
                                }

                                const image = getItemImage(item);



                                return (
                                    <div key={item.cartId} className="flex gap-4">
                                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0 flex items-center justify-center border">
                                            {image ? (
                                                <img src={image} className="w-full h-full object-cover" />
                                            ) : (
                                                getItemIcon(item.type)
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <Link
                                                    href={getItemLink(item)}
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
                            {total === 0 ? (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={() => setIsFreeCheckoutOpen(true)}
                                >
                                    {t("completeFreeOrder") || "Complete Free Order"}
                                </Button>
                            ) : (
                                <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isLoading}>
                                    {isLoading ? (t("processing") || "Processing...") : (t("checkout") || "Checkout")}
                                </Button>
                            )}
                        </div>
                    </SheetFooter>
                )}
            </SheetContent>

            <Dialog open={isFreeCheckoutOpen} onOpenChange={setIsFreeCheckoutOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Free Order</DialogTitle>
                        <DialogDescription>
                            Please provide your details to receive your tickets.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="Your Name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFreeCheckoutOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleFreeCheckout}
                            disabled={isLoading || !customerName || !customerEmail}
                        >
                            {isLoading ? "Processing..." : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Sheet>
    );
}
