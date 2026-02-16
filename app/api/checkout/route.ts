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
        const lineItems = items.map((item) => {
            let name = "";
            let description = "";
            let image = "";
            let unitAmount = 0; // in cents

            if (item.type === 'album_physical') {
                name = `Vinyl: ${item.album.title}`;
                description = `${item.album.artist} - Physical Record`;
                image = item.album.coverImage;
                unitAmount = Math.round(item.album.physicalPrice * 100);
            } else if (item.type === 'album_digital') {
                name = `Digital: ${item.album.title}`;
                description = `${item.album.artist} - Digital Download`;
                image = item.album.coverImage;
                unitAmount = Math.round(item.album.digitalPrice * 100);
            } else if (item.type === 'track' && item.track) {
                name = `Track: ${item.track.title}`;
                description = `${item.album.artist} - Single Track`;
                image = item.album.coverImage;
                unitAmount = Math.round(item.track.price * 100);
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
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity,
            };
        });

        const origin = req.headers.get("origin") || "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: lineItems,
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
            success_url: `${origin}/success`,
            cancel_url: `${origin}/`,
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
