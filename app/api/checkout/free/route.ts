import { NextResponse } from "next/server";
import { serverClient } from "@/lib/sanity.server";
import { CartItem } from "@/lib/store";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, customerName, customerEmail, locale } = body;


        if (!process.env.SANITY_API_TOKEN) {
            console.error("SANITY_API_TOKEN is missing");
            return NextResponse.json({ error: "Configuration Error", details: "SANITY_API_TOKEN is missing in server environment" }, { status: 500 });
        }

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Empty cart" }, { status: 400 });
        }

        // Filter only event items for now (since only events are free)
        // Or maybe allow mixed cart if total is 0?
        // But for now, let's assume this route is hit when total is 0.

        const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        // 1. Validate Prices & Create Order in Sanity
        let calculatedTotal = 0;

        const orderItems = await Promise.all(items.map(async (item: CartItem) => {
            const sanityId = item.type === 'event' && item.event ? item.event.id :
                item.type === 'track' && item.track ? item.track.id :
                    item.album ? item.album.id : "";

            let price = 0;
            let title = item.type === 'event' && item.event ? item.event.title :
                item.type === 'track' && item.track ? item.track.title :
                    item.album ? item.album.title : "Unknown";

            // Server-side validation for Events
            if (item.type === 'event' && item.event) {
                const query = `*[_type == "event" && _id == $eventId][0] {
                        _id,
                        title,
                        price,
                        pricingTiers[] {
                            name,
                            price,
                            startDate,
                            endDate,
                            ticketLimit
                        }
                    }`;
                const sanityEvent = await serverClient.fetch(query, { eventId: item.event.id });

                if (sanityEvent) {
                    title = sanityEvent.title;
                    price = sanityEvent.price;

                    if (sanityEvent.pricingTiers && sanityEvent.pricingTiers.length > 0) {
                        const { getActiveTier } = await import("@/lib/products");
                        const countQuery = `count(*[_type == "ticket" && event._ref == $eventId && status != "cancelled"])`;
                        const soldCount = await serverClient.fetch(countQuery, { eventId: item.event.id });
                        const activeTier = getActiveTier(sanityEvent.pricingTiers, soldCount);
                        if (activeTier) {
                            price = activeTier.price;
                        }
                    }
                }
            }

            calculatedTotal += price * item.quantity;

            return {
                _key: item.cartId,
                type: item.type,
                title: title,
                price: price,
                quantity: item.quantity,
                sanityId: sanityId
            };
        }));

        if (calculatedTotal > 0) {
            return NextResponse.json({
                error: "Price Mismatch",
                details: "Items are not free. Please use standard checkout."
            }, { status: 400 });
        }

        const orderDoc = {
            _type: 'order',
            orderId: orderId,
            stripeSessionId: `free-${orderId}`,
            customerName,
            customerEmail,
            amount: 0,
            currency: 'eur',
            status: 'completed', // Free orders are effectively completed immediately
            createdAt: new Date().toISOString(),
            items: orderItems
        };

        const createdOrder = await serverClient.create(orderDoc);

        // 2. Generate Tickets for Events
        const tickets = [];
        for (const item of items) {
            if (item.type === 'event' && item.event) {
                for (let i = 0; i < item.quantity; i++) {
                    const ticketCode = crypto.randomUUID();
                    const ticketDoc = {
                        _type: 'ticket',
                        code: ticketCode,
                        status: 'active',
                        event: {
                            _type: 'reference',
                            _ref: item.event.id
                        },
                        order: {
                            _type: 'reference',
                            _ref: createdOrder._id
                        },
                        attendeeName: customerName,
                        attendeeEmail: customerEmail
                    };
                    const createdTicket = await serverClient.create(ticketDoc);
                    tickets.push({
                        code: ticketCode,
                        eventName: item.event.title,
                        attendeeName: customerName
                    });
                }
            }
        }

        // 3. Send Confirmation Email
        try {
            await sendOrderConfirmationEmail({
                orderId: createdOrder.orderId,
                customerName: customerName,
                customerEmail: customerEmail,
                items: items.map((item: CartItem) => ({
                    title: item.type === 'event' && item.event ? item.event.title :
                        item.type === 'track' && item.track ? item.track.title :
                            item.album ? item.album.title : "Unknown",
                    quantity: item.quantity,
                    price: 0 // Free checkout
                })),
                total: 0
            }, tickets);
        } catch (emailError) {
            console.error("Failed to send email for free order:", emailError);
            // Don't fail the request, just log it
        }

        return NextResponse.json({ success: true, orderId: createdOrder._id, tickets });

    } catch (error: any) {
        console.error("Free Checkout Error:", error);
        return NextResponse.json(
            {
                error: "Internal Server Error",
                details: error.message,
                stack: error.stack
            },
            { status: 500 }
        );
    }
}
