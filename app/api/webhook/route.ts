import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-12-15.clover" as any,
    typescript: true,
});

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN, // Ensure this env var exists with write permissions
});

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ""
        );
    } catch (error: any) {
        console.error(`Webhook Error: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        // 1. Retrieve the items from the session (expand line_items)
        // Note: We might need to fetch the session again to get line items if not present
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items'],
        });

        const lineItems = sessionWithLineItems.line_items?.data || [];

        // 2. Map Stripe items to our Order schema format
        const orderItems = lineItems.map((item) => ({
            _key: item.id, // Sanity needs a key for array items
            name: item.description,
            // We can't easily map back to 'physical' | 'digital' | 'track' perfectly 
            // unless we store that in metadata on the line item. 
            // For now, we'll try to guess based on description or just store as generic.
            // Better approach: Add metadata to line items in checkout route.
            type: item.description?.toLowerCase().includes('vinyl') ? 'physical' :
                item.description?.toLowerCase().includes('digital') ? 'digital' : 'track',
            quantity: item.quantity,
            price: (item.price?.unit_amount || 0) / 100,
        }));

        // 3. Create Order in Sanity
        try {
            await client.create({
                _type: 'order',
                orderId: session.id,
                customerName: session.customer_details?.name || 'Guest',
                customerEmail: session.customer_details?.email || '',
                amount: (session.amount_total || 0) / 100,
                status: 'paid', // Initially paid since this event confirms it
                items: orderItems,
                createdAt: new Date().toISOString()
            });
            console.log(`Order created for session ${session.id}`);
        } catch (sanityError) {
            console.error('Error creating order in Sanity:', sanityError);
            return new NextResponse('Error creating order in Sanity', { status: 500 });
        }
    }

    return new NextResponse(null, { status: 200 });
}
