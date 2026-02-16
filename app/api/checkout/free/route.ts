import { NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { CartItem } from "@/lib/store";

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, customerName, customerEmail } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Empty cart" }, { status: 400 });
        }

        // Calculate total to verify it is indeed 0
        const total = items.reduce((acc: number, item: CartItem) => {
            let price = 0;
            if (item.type === 'album_physical' && item.album) price = item.album.physicalPrice;
            else if (item.type === 'album_digital' && item.album) price = item.album.digitalPrice;
            else if (item.type === 'track' && item.track) price = item.track.price;
            else if (item.type === 'event' && item.event) price = item.event.price;
            return acc + price * item.quantity;
        }, 0);

        if (total > 0) {
            return NextResponse.json({ error: "Total is not 0" }, { status: 400 });
        }

        // Create Order
        const orderId = crypto.randomUUID();

        const orderItems = items.map((item: CartItem) => ({
            _key: crypto.randomUUID(),
            name: item.type === 'track' && item.track ? item.track.title :
                item.type === 'event' && item.event ? item.event.title :
                    item.album?.title || "Unknown",
            type: item.type === 'event' ? 'event' :
                item.type === 'album_physical' ? 'physical' :
                    item.type === 'album_digital' ? 'digital' : 'track',
            quantity: item.quantity,
            price: 0
        }));

        const createdOrder = await client.create({
            _type: 'order',
            orderId: orderId, // External ID for URL
            customerName,
            customerEmail,
            amount: 0,
            status: 'paid',
            items: orderItems,
            createdAt: new Date().toISOString()
        });

        // Generate Tickets for Events
        for (const item of items) {
            if (item.type === 'event' && item.event) {
                for (let i = 0; i < item.quantity; i++) {
                    const ticketCode = crypto.randomUUID();
                    await client.create({
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
                    });
                }
            }
        }

        return NextResponse.json({ success: true, orderId: orderId });
    } catch (error) {
        console.error("Free Checkout Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
