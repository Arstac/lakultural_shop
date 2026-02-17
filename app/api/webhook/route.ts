import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { sendOrderConfirmationEmail } from "@/lib/email";

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
        // 1. Retrieve the items from the session (expand line_items and product metadata)
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items', 'line_items.data.price.product'],
        });

        const lineItems = sessionWithLineItems.line_items?.data || [];

        // 2. Map Stripe items to our Order schema format
        const orderItems = lineItems.map((item) => {
            const product = item.price?.product as Stripe.Product;
            const metadata = product?.metadata || {};

            return {
                _key: item.id,
                name: item.description,
                type: metadata.type || (item.description?.toLowerCase().includes('vinyl') ? 'physical' :
                    item.description?.toLowerCase().includes('digital') ? 'digital' : 'track'),
                quantity: item.quantity || 1,
                price: (item.price?.unit_amount || 0) / 100,
                sanity_id: metadata.sanity_id
            };
        });

        // 3. Create Order in Sanity
        try {
            const createdOrder = await client.create({
                _type: 'order',
                orderId: session.id,
                customerName: session.customer_details?.name || 'Guest',
                customerEmail: session.customer_details?.email || '',
                amount: (session.amount_total || 0) / 100,
                status: 'paid', // Initially paid since this event confirms it
                items: orderItems.map(item => ({
                    _key: item._key,
                    name: item.name,
                    type: item.type,
                    quantity: item.quantity,
                    price: item.price
                })),
                createdAt: new Date().toISOString()
            });

            // 4. Generate Tickets for Events
            const tickets = [];
            for (const item of orderItems) {
                if (item.type === 'event' && item.sanity_id) {
                    for (let i = 0; i < item.quantity; i++) {
                        const ticketCode = crypto.randomUUID();
                        await client.create({
                            _type: 'ticket',
                            code: ticketCode,
                            status: 'active',
                            event: {
                                _type: 'reference',
                                _ref: item.sanity_id
                            },
                            order: {
                                _type: 'reference',
                                _ref: createdOrder._id
                            },
                            attendeeName: session.customer_details?.name || 'Guest',
                            attendeeEmail: session.customer_details?.email || ''
                        });
                        tickets.push({
                            code: ticketCode,
                            eventName: item.name || "Evento",
                            attendeeName: session.customer_details?.name || 'Guest'
                        });
                    }
                }
            }

            // 5. Send Confirmation Email
            if (session.customer_details?.email) {
                try {
                    await sendOrderConfirmationEmail({
                        orderId: session.id,
                        customerName: session.customer_details?.name || 'Guest',
                        customerEmail: session.customer_details?.email,
                        items: orderItems.map(item => ({
                            title: item.name || "Producto",
                            quantity: item.quantity,
                            price: item.price
                        })),
                        total: (session.amount_total || 0) / 100
                    }, tickets);
                } catch (emailError) {
                    console.error("Failed to send email for paid order:", emailError);
                }
            }

            console.log(`Order created for session ${session.id}`);
        } catch (sanityError) {
            console.error('Error creating order in Sanity:', sanityError);
            return new NextResponse('Error creating order in Sanity', { status: 500 });
        }
    }

    return new NextResponse(null, { status: 200 });
}
