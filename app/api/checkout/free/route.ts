import { NextResponse } from "next/server";
import { serverClient } from "@/lib/sanity.server";
import { CartItem } from "@/lib/store";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, customerName, customerEmail, locale } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Empty cart" }, { status: 400 });
        }

        // Filter only event items for now (since only events are free)
        // Or maybe allow mixed cart if total is 0?
        // But for now, let's assume this route is hit when total is 0.

        const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        // 1. Create Order in Sanity
        const orderDoc = {
            _type: 'order',
            orderNumber: orderId,
            stripeSessionId: `free-${orderId}`,
            customerName,
            customerEmail,
            amount: 0,
            currency: 'eur',
            status: 'completed', // Free orders are effectively completed immediately
            createdAt: new Date().toISOString(),
            items: items.map((item: CartItem) => {
                const sanityId = item.type === 'event' && item.event ? item.event.id :
                    item.type === 'track' && item.track ? item.track.id :
                        item.album ? item.album.id : "";

                return {
                    _key: item.cartId,
                    type: item.type,
                    title: item.type === 'event' && item.event ? item.event.title :
                        item.type === 'track' && item.track ? item.track.title :
                            item.album ? item.album.title : "Unknown",
                    price: 0,
                    quantity: item.quantity,
                    sanityId: sanityId
                };
            })
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
                    tickets.push(createdTicket);
                }
            }
        }

        return NextResponse.json({ success: true, orderId: createdOrder._id, tickets });

    } catch (error) {
        console.error("Free Checkout Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
