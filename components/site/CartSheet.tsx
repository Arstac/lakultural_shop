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
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

export function CartSheet() {
    const { items, removeItem, updateQuantity, isOpen, setIsOpen } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const t = useTranslations("Cart");
    const locale = useLocale();

    const total = items.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0
    );

    const handleCheckout = async () => {
        setIsLoading(true);
        try {
            // TODO: Replace with actual API call once backend is ready
            // const response = await fetch("/api/checkout", { ... });
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

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="flex flex-col w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t("title")} ({items.length})</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                            <ShoppingBag className="w-12 h-12 opacity-20" />
                            <p>{t("empty")}</p>
                            <Button variant="link" onClick={() => setIsOpen(false)}>
                                {t("viewCollection")}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6 px-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
                                        {/* Placeholder Logic */}
                                        <div className="w-full h-full flex items-center justify-center bg-secondary text-xs text-center p-1">
                                            {item.variant.name}
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <Link
                                                href={`/producto/${item.product.slug}`}
                                                onClick={() => setIsOpen(false)}
                                                className="font-semibold text-sm line-clamp-1 hover:underline hover:text-primary transition-colors"
                                            >
                                                {item.product.name}
                                            </Link>
                                            <p className="text-sm text-muted-foreground">{item.variant.name}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <span className="text-sm w-4 text-center">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-between items-end">
                                        <span className="font-medium text-sm">
                                            {(item.product.price * item.quantity).toFixed(2)}€
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <SheetFooter className="border-t pt-6">
                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>{t("total")}</span>
                                <span>{total.toFixed(2)}€</span>
                            </div>
                            <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isLoading}>
                                {isLoading ? t("processing") : t("checkout")}
                            </Button>
                        </div>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
