"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useCart } from "@/lib/store";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getOrderDetails } from "@/app/actions/stripe";
import { getSanityOrderDetails } from "@/app/actions/sanity_orders";

interface OrderSummary {
    amount_total: number | null;
    currency: string | null;
    customer_details: {
        name?: string | null;
        email?: string | null;
    } | null;
    items: {
        description: string | null;
        quantity: number | null;
        amount_total: number;
        currency: string;
    }[] | undefined;
}

// Need to import Stripe types for client side usage if not available globally
import Stripe from "stripe";

export default function SuccessPage() {
    const t = useTranslations("Success");
    const locale = useLocale();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const orderId = searchParams.get("order_id");
    const [order, setOrder] = useState<OrderSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { clearCart } = useCart();

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    useEffect(() => {
        if (sessionId) {
            getOrderDetails(sessionId).then((data) => {
                setOrder(data as OrderSummary);
                setIsLoading(false);
            });
        } else if (orderId) {
            getSanityOrderDetails(orderId).then((data) => {
                setOrder(data as OrderSummary);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [sessionId, orderId]);

    return (
        <div className="container flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="p-4 rounded-full bg-green-100 text-green-600 animate-in zoom-in duration-500">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight">
                        {t("title")}
                    </h1>

                    <p className="text-muted-foreground">
                        {t("description")}
                    </p>
                </div>

                {isLoading ? (
                    <div className="p-8 border rounded-lg bg-muted/50 flex justify-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : order ? (
                    <div className="border rounded-lg bg-card text-card-foreground shadow-sm overflow-hidden">
                        <div className="bg-muted/30 p-4 border-b">
                            <h2 className="font-semibold flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" />
                                {t("orderSummary") || "Order Summary"}
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                {order.items?.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span>
                                            {item.quantity}x {item.description}
                                        </span>
                                        <span className="font-medium">
                                            {((item.amount_total) / 100).toFixed(2)}€
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 flex justify-between font-bold">
                                <span>Total</span>
                                <span>{((order.amount_total || 0) / 100).toFixed(2)}€</span>
                            </div>

                            {order.customer_details?.email && (
                                <div className="text-xs text-muted-foreground text-center pt-2">
                                    {t("confirmationSentTo")}: {order.customer_details.email}
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}

                <div className="pt-4">
                    <Button size="lg" className="w-full" asChild>
                        <Link href={`/${locale}`}>
                            {t("backHome")}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
