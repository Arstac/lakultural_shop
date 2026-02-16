"use server";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-12-15.clover" as any,
    typescript: true,
});

export async function getOrderDetails(sessionId: string) {
    if (!sessionId) return null;

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["line_items", "line_items.data.price.product"],
        });

        return {
            amount_total: session.amount_total,
            currency: session.currency,
            customer_details: session.customer_details,
            payment_status: session.payment_status,
            items: session.line_items?.data.map((item) => ({
                id: item.id,
                description: item.description,
                quantity: item.quantity,
                amount_total: item.amount_total,
                currency: item.currency,
            })),
        };
    } catch (error) {
        console.error("Error fetching session details:", error);
        return null;
    }
}
