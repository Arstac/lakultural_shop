import { NextResponse } from "next/server";
import Stripe from "stripe";
import { CartItem } from "@/lib/store";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy_key_for_build", {
    apiVersion: "2025-12-15.clover" as any,
    typescript: true,
});

export async function POST(req: Request) {
    try {
        // Mock success for development/demo if key is missing
        if (process.env.STRIPE_SECRET_KEY?.startsWith("dummy") || !process.env.STRIPE_SECRET_KEY) {
            console.log("Mocking Stripe checkout session for development");
            const origin = req.headers.get("origin") || "http://localhost:3000";
            return NextResponse.json({ url: `${origin}/success` });
        }

        const body = await req.json();
        const items = body.items as CartItem[];

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Empty cart" }, { status: 400 });
        }

        // Transform cart items to Stripe line items
        // We need to fetch fresh data for events to ensure price is correct (Early Bird)
        const lineItems = await Promise.all(items.map(async (item) => {
            let name = "";
            let description = "";
            let image = "";
            let unitAmount = 0; // in cents

            if (item.type === 'album_physical' && item.album) {
                name = `Vinyl: ${item.album.title}`;
                description = `${item.album.artist} - Physical Record`;
                image = item.album.coverImage;
                unitAmount = Math.round(item.album.physicalPrice * 100);
            } else if (item.type === 'album_digital' && item.album) {
                name = `Digital: ${item.album.title}`;
                description = `${item.album.artist} - Digital Download`;
                image = item.album.coverImage;
                unitAmount = Math.round(item.album.digitalPrice * 100);
            } else if (item.type === 'track' && item.track && item.album) {
                name = `Track: ${item.track.title}`;
                description = `${item.album.artist} - Single Track`;
                image = item.album.coverImage;
                unitAmount = Math.round(item.track.price * 100);
            } else if (item.type === 'event' && item.event) {
                // SERVER-SIDE PRICE VALIDATION
                try {
                    const eventId = item.event.id;
                    const query = `*[_type == "event" && _id == $eventId][0] {
                        _id,
                        title,
                        date,
                        location,
                        price,
                        pricingTiers[] {
                            name,
                            price,
                            startDate,
                            endDate,
                            ticketLimit
                        },
                        "image": image.asset->url
                    }`;

                    const { serverClient } = await import("@/lib/sanity.server");
                    const { getActiveTier } = await import("@/lib/products");
                    const sanityEvent = await serverClient.fetch(query, { eventId });

                    if (sanityEvent) {
                        name = `Ticket: ${sanityEvent.title}`;
                        description = `Event Ticket - ${new Date(sanityEvent.date).toLocaleDateString()} @ ${sanityEvent.location}`;
                        image = sanityEvent.image;

                        // Dynamic Price Logic using Pricing Tiers
                        let finalPrice = sanityEvent.price;
                        if (sanityEvent.pricingTiers && sanityEvent.pricingTiers.length > 0) {
                            const countQuery = `count(*[_type == "ticket" && event._ref == $eventId && status != "cancelled"])`;
                            const soldCount = await serverClient.fetch(countQuery, { eventId });
                            const activeTier = getActiveTier(sanityEvent.pricingTiers, soldCount);
                            if (activeTier) {
                                finalPrice = activeTier.price;
                            }
                        }

                        unitAmount = Math.round(finalPrice * 100);
                    } else {
                        // Fallback to client data if sanity fetch fails (should not happen)
                        name = `Ticket: ${item.event.title}`;
                        description = `Event Ticket - ${new Date(item.event.date).toLocaleDateString()} @ ${item.event.location}`;
                        image = item.event.image;
                        unitAmount = Math.round(item.event.price * 100);
                    }

                } catch (e) {
                    console.error("Error fetching event details in checkout:", e);
                    // Fallback
                    name = `Ticket: ${item.event.title}`;
                    description = `Event Ticket - ${new Date(item.event.date).toLocaleDateString()} @ ${item.event.location}`;
                    image = item.event.image;
                    unitAmount = Math.round(item.event.price * 100);
                }
            } else {
                return undefined;
            }

            // Ensure absolute URL for images if it's a relative path
            let imageUrls: string[] = [];
            if (image) {
                if (image.startsWith("http")) {
                    imageUrls = [image];
                } else {
                    const origin = req.headers.get("origin") || "http://localhost:3000";
                    // Handle case where image path might already have a leading slash
                    const imagePath = image.startsWith("/") ? image : `/${image}`;
                    imageUrls = [`${origin}${imagePath}`];
                }
            }

            return {
                price_data: {
                    currency: "eur",
                    product_data: {
                        name,
                        description,
                        images: imageUrls.length > 0 ? imageUrls : undefined,
                        metadata: {
                            sanity_id: item.type === 'event' && item.event ? item.event.id :
                                item.type === 'track' && item.track ? item.track.id :
                                    item.album ? item.album.id : "",
                            type: item.type
                        }
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity,
            };
        }));

        const validLineItems = lineItems.filter((item) => item !== undefined) as Stripe.Checkout.SessionCreateParams.LineItem[];

        const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

        const locale = body.locale || "es";

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: validLineItems,
            shipping_address_collection: {
                allowed_countries: ["ES", "FR", "GB", "US"],
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 0,
                            currency: 'eur',
                        },
                        display_name: 'Standard Shipping',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 3 },
                            maximum: { unit: 'business_day', value: 5 },
                        },
                    },
                },
            ],
            success_url: `${origin}/${locale}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/${locale}/`,
            // Add metadata to track order in webhook
            metadata: {
                source: "lakultural_shop",
            },
            // Ask for customer email to be pre-filled if available, or just collected
            customer_email: undefined, // Add logic if we have user auth
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
