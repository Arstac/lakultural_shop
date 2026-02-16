"use server";

import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
});

export async function getSanityOrderDetails(orderId: string) {
    if (!orderId) return null;

    try {
        const order = await client.fetch(`*[_type == "order" && orderId == $orderId][0]`, { orderId });

        if (!order) return null;

        return {
            amount_total: Math.round(order.amount * 100),
            currency: 'eur',
            customer_details: {
                name: order.customerName,
                email: order.customerEmail,
            },
            items: order.items.map((item: any) => ({
                description: item.name,
                quantity: item.quantity,
                amount_total: Math.round(item.price * 100 * item.quantity),
                currency: 'eur'
            }))
        };
    } catch (error) {
        console.error("Error fetching Sanity order:", error);
        return null;
    }
}
